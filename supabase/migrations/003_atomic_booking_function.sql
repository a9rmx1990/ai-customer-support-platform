-- =============================================================================
-- Migration 003: Atomic Appointment Booking Function
-- Project: AI Medical Customer Support Platform
-- =============================================================================
-- This PostgreSQL function runs ATOMICALLY inside a single transaction.
-- It prevents race conditions where two patients attempt to book the same slot.
-- The patient_id is derived from auth.uid() — never trusted from client input.

CREATE OR REPLACE FUNCTION public.book_appointment_atomic(
  p_doctor_id       UUID,
  p_scheduled_start TIMESTAMPTZ,
  p_scheduled_end   TIMESTAMPTZ,
  p_reason          TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs with function owner privileges to bypass RLS for booking logic
AS $$
DECLARE
  v_patient_id       UUID;
  v_patient_profile  UUID;
  v_doctor_verified  BOOLEAN;
  v_overlap_count    INTEGER;
  v_appointment_id   UUID;
  v_notification_id  UUID;
  v_doctor_user_id   UUID;
  v_doctor_name      TEXT;
  v_patient_name     TEXT;
BEGIN

  -- 1. Identify the authenticated patient from Supabase Auth session
  v_patient_id := auth.uid();
  IF v_patient_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'UNAUTHENTICATED');
  END IF;

  -- 2. Verify the user is a patient (not a doctor or admin booking on behalf)
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = v_patient_id AND role = 'patient'
  ) THEN
    RETURN json_build_object('success', false, 'error', 'UNAUTHORIZED');
  END IF;

  -- 3. Verify the doctor exists and is verified
  SELECT
    dp.user_id,
    dp.verification_status = 'verified',
    pr.full_name
  INTO v_doctor_user_id, v_doctor_verified, v_doctor_name
  FROM public.doctor_profiles dp
  JOIN public.profiles pr ON pr.id = dp.user_id
  WHERE dp.id = p_doctor_id;

  IF v_doctor_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'DOCTOR_NOT_FOUND');
  END IF;

  IF NOT v_doctor_verified THEN
    RETURN json_build_object('success', false, 'error', 'DOCTOR_NOT_VERIFIED');
  END IF;

  -- 4. Validate slot times
  IF p_scheduled_start >= p_scheduled_end THEN
    RETURN json_build_object('success', false, 'error', 'INVALID_SLOT_TIMES');
  END IF;

  IF p_scheduled_start < NOW() THEN
    RETURN json_build_object('success', false, 'error', 'SLOT_IN_THE_PAST');
  END IF;

  -- 5. ATOMIC overlap check — lock the rows to prevent concurrent bookings
  SELECT COUNT(*) INTO v_overlap_count
  FROM public.appointments
  WHERE
    doctor_id = p_doctor_id
    AND status NOT IN ('cancelled', 'no_show', 'rescheduled')
    AND tstzrange(scheduled_start, scheduled_end) && tstzrange(p_scheduled_start, p_scheduled_end)
  FOR UPDATE;  -- Exclusive lock prevents concurrent inserts from racing

  IF v_overlap_count > 0 THEN
    RETURN json_build_object('success', false, 'error', 'SLOT_UNAVAILABLE');
  END IF;

  -- 6. Create the appointment
  INSERT INTO public.appointments (
    patient_id, doctor_id, scheduled_start, scheduled_end, status, reason
  ) VALUES (
    v_patient_id, p_doctor_id, p_scheduled_start, p_scheduled_end, 'confirmed', p_reason
  )
  RETURNING id INTO v_appointment_id;

  -- 7. Fetch patient name for notifications
  SELECT full_name INTO v_patient_name
  FROM public.profiles WHERE id = v_patient_id;

  -- 8. Create notification for the patient
  INSERT INTO public.notifications (user_id, type, title, message, appointment_id)
  VALUES (
    v_patient_id,
    'APPOINTMENT_BOOKED',
    'Appointment Confirmed',
    'Your appointment with ' || COALESCE(v_doctor_name, 'your doctor') || ' on ' ||
      TO_CHAR(p_scheduled_start AT TIME ZONE 'UTC', 'Mon DD, YYYY at HH12:MI AM') || ' has been confirmed.',
    v_appointment_id
  );

  -- 9. Create notification for the doctor
  INSERT INTO public.notifications (user_id, type, title, message, appointment_id)
  VALUES (
    v_doctor_user_id,
    'APPOINTMENT_BOOKED',
    'New Appointment',
    'A new appointment with ' || COALESCE(v_patient_name, 'a patient') || ' is scheduled for ' ||
      TO_CHAR(p_scheduled_start AT TIME ZONE 'UTC', 'Mon DD, YYYY at HH12:MI AM') || '.',
    v_appointment_id
  );

  -- 10. Write audit log
  INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, metadata)
  VALUES (
    v_patient_id,
    'APPOINTMENT_CREATED',
    'appointments',
    v_appointment_id::TEXT,
    jsonb_build_object(
      'doctor_id', p_doctor_id,
      'scheduled_start', p_scheduled_start,
      'scheduled_end', p_scheduled_end
    )
  );

  -- 11. Return success
  RETURN json_build_object(
    'success', true,
    'appointment_id', v_appointment_id,
    'status', 'confirmed',
    'scheduled_start', p_scheduled_start,
    'scheduled_end', p_scheduled_end
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Catch any unexpected error — transaction rolls back automatically
    RETURN json_build_object('success', false, 'error', 'BOOKING_FAILED', 'detail', SQLERRM);
END;
$$;

-- =============================================================================
-- Cancel Appointment Function (with authorization check)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.cancel_appointment_safe(
  p_appointment_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id       UUID;
  v_appointment   RECORD;
BEGIN

  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'UNAUTHENTICATED');
  END IF;

  -- Fetch the appointment
  SELECT * INTO v_appointment
  FROM public.appointments
  WHERE id = p_appointment_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'APPOINTMENT_NOT_FOUND');
  END IF;

  -- Authorization: patient must own the appointment, or doctor must own it
  IF v_appointment.patient_id != v_user_id THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.doctor_profiles dp
      WHERE dp.id = v_appointment.doctor_id AND dp.user_id = v_user_id
    ) THEN
      RETURN json_build_object('success', false, 'error', 'UNAUTHORIZED');
    END IF;
  END IF;

  -- Check it can be cancelled
  IF v_appointment.status IN ('cancelled', 'completed') THEN
    RETURN json_build_object('success', false, 'error', 'CANCELLATION_NOT_ALLOWED');
  END IF;

  -- Cancel it
  UPDATE public.appointments
  SET status = 'cancelled', updated_at = NOW()
  WHERE id = p_appointment_id;

  -- Audit log
  INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id)
  VALUES (v_user_id, 'APPOINTMENT_CANCELLED', 'appointments', p_appointment_id::TEXT);

  RETURN json_build_object('success', true, 'appointment_id', p_appointment_id, 'status', 'cancelled');

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', 'CANCELLATION_FAILED', 'detail', SQLERRM);
END;
$$;
