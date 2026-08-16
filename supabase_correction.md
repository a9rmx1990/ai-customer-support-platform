# Supabase Medical Platform — Production Hardening & Real-Time Communication

I have an existing Supabase database migration for an AI Medical Customer Support Platform.

The current schema contains:

* `profiles`
* `patient_profiles`
* `doctor_profiles`
* `doctor_availability`
* `doctor_schedule_exceptions`
* `appointments`
* `notifications`
* `audit_logs`
* Supabase Auth integration
* Automatic profile creation on signup
* Appointment overlap prevention
* Automatic `updated_at` triggers

I want to upgrade this database from a prototype into a **real-world, production-oriented doctor–patient platform**.

## Primary Objective

Modify and extend the existing Supabase schema so that it supports:

1. Secure authentication and role management
2. Proper Row Level Security
3. Real doctor–patient communication
4. Production-grade appointment scheduling
5. Doctor availability management
6. Notifications
7. Immutable audit logging
8. Real-time messaging through Supabase Realtime
9. Secure separation between patients, doctors, and admins

Do **not** create fake doctors, bots, simulated users, or mock conversations.

The application must work with **real authenticated Supabase users**.

---

## 1. Fix Role Assignment Security

The current signup trigger reads the user's role from:

```sql
NEW.raw_user_meta_data->>'role'
```

This is insecure because a client could potentially attempt to register as an admin or doctor.

Change the signup flow so:

* Every newly registered user defaults to `patient`
* `admin` cannot be self-assigned
* `doctor` cannot be self-assigned
* Doctor accounts must be created/promoted through a trusted administrative process
* Admin privileges must never depend on client-provided metadata

Keep Supabase `auth.users` as the source of authentication identity.

---

## 2. Implement Row Level Security

Enable RLS on every application table:

* `profiles`
* `patient_profiles`
* `doctor_profiles`
* `doctor_availability`
* `doctor_schedule_exceptions`
* `appointments`
* `notifications`
* `audit_logs`

Create secure policies based on the authenticated user's role.

### Patients

Patients should be able to:

* Read/update their own profile
* Read/update their own patient profile
* View verified doctors
* View appropriate doctor public information
* Create appointments for themselves
* View their own appointments
* Cancel their own eligible appointments
* View their own notifications
* Mark their own notifications as read
* Participate in conversations they belong to
* Send messages only within conversations they participate in

Patients must NOT be able to:

* Read another patient's private information
* Modify doctor profiles
* Modify doctor verification status
* Modify appointments belonging to other patients
* Read audit logs
* Modify audit logs
* Assign themselves doctor/admin roles

### Doctors

Doctors should be able to:

* Read/update their own doctor profile where appropriate
* Manage their own availability
* Manage their own schedule exceptions
* View appointments assigned to them
* Update appointment status according to allowed workflow
* View appropriate patient information associated with their appointments
* Participate in conversations with their patients
* Send messages within conversations they participate in
* View their own notifications

Doctors must NOT be able to:

* Modify another doctor's profile
* Modify verification status
* Access unrelated patients
* Access unrelated appointments
* Read or modify audit logs

### Admins

Admins should be able to:

* Manage users
* Verify/reject/suspend doctors
* Manage doctor verification
* Review appropriate audit information
* Manage platform-level resources

Do not give admins unrestricted access unless it is explicitly necessary.

---

# 3. Improve Appointment Validation

Modify `appointments` so:

```sql
scheduled_end > scheduled_start
```

is always enforced.

Preserve the existing PostgreSQL exclusion constraint preventing overlapping active appointments.

Ensure cancelled, no-show, and rescheduled appointments do not block future bookings.

Consider the complete appointment lifecycle:

```text
requested
confirmed
cancelled
completed
no_show
rescheduled
```

Prevent invalid status transitions where practical.

---

# 4. Improve Doctor Availability

The current schema has:

```sql
UNIQUE (doctor_id, day_of_week)
```

Remove this restriction.

A doctor must be able to have multiple availability periods on the same day.

Example:

```text
Monday
09:00 - 12:00
14:00 - 17:00
```

Enforce:

```sql
end_time > start_time
```

Prevent overlapping availability periods for the same doctor/day where practical.

Keep:

```text
0 = Sunday
1 = Monday
...
6 = Saturday
```

---

# 5. Doctor Schedule Exceptions

Keep support for:

* available
* unavailable
* leave
* holiday

Allow exceptions to override the recurring weekly schedule.

Prevent logically invalid time ranges.

Design the schema so the appointment-booking logic can determine the doctor's effective availability for a particular date.

---

# 6. Add Real Doctor–Patient Messaging

The current system needs a real communication layer.

Create:

## conversations

Fields should include at minimum:

```text
id
appointment_id
created_at
updated_at
```

A conversation should optionally be associated with an appointment.

## conversation_participants

Fields:

```text
conversation_id
user_id
joined_at
```

This allows multiple authenticated users to belong to a conversation while maintaining explicit membership.

## messages

Fields:

```text
id
conversation_id
sender_id
content
created_at
updated_at
read_at
```

Add appropriate indexes.

Messages must reference real authenticated users.

Do not create bot users.

---

# 7. Messaging Security

Implement RLS so a user can only:

* Read conversations they participate in
* Read messages from conversations they participate in
* Send messages to conversations they participate in
* Mark appropriate messages as read

A user must not be able to access a conversation merely by knowing its UUID.

The sender must always correspond to the authenticated user.

Prevent users from impersonating another sender.

---

# 8. Supabase Realtime

Design the messaging tables so they can work with Supabase Realtime.

The frontend should eventually be able to subscribe to:

```text
new messages
message updates
read receipts
```

Do not implement fake polling or bot responses.

The communication flow should be:

```text
Patient browser
      ↓
Supabase
      ↓
messages table
      ↓
Supabase Realtime
      ↓
Doctor browser
```

and vice versa.

---

# 9. Notifications

Keep the existing `notifications` table.

Extend the design where necessary to support events such as:

```text
appointment_requested
appointment_confirmed
appointment_cancelled
appointment_rescheduled
appointment_completed
new_message
doctor_verified
appointment_reminder
```

Notifications must belong to real authenticated users.

Users should only be able to read/update their own notifications.

---

# 10. Audit Logging

Make `audit_logs` effectively immutable to normal application users.

Users must not be able to:

```text
UPDATE audit_logs
DELETE audit_logs
```

Audit important events such as:

```text
doctor_verified
doctor_rejected
doctor_suspended
appointment_created
appointment_confirmed
appointment_cancelled
appointment_rescheduled
message_sent
profile_updated
```

Do not store unnecessary sensitive medical information inside audit metadata.

---

# 11. Database Functions / Security

Review all `SECURITY DEFINER` functions.

Where appropriate:

```sql
SET search_path = public;
```

Avoid security vulnerabilities caused by unsafe search paths.

Do not expose privileged database functions directly to untrusted clients unless their authorization is explicitly validated.

---

# 12. Indexing

Add appropriate indexes for:

```text
appointments.doctor_id
appointments.patient_id
appointments.scheduled_start
appointments.status

messages.conversation_id
messages.created_at
messages.sender_id

conversation_participants.user_id
conversation_participants.conversation_id

notifications.user_id
notifications.read
notifications.created_at

doctor_profiles.verification_status
doctor_profiles.specialization
```

Do not add unnecessary indexes blindly.

---

# 13. Data Integrity

Maintain foreign-key relationships and cascading behavior carefully.

Do not allow deletion of records that would destroy important medical/appointment history.

Prefer soft-state transitions such as:

```text
cancelled
completed
suspended
```

instead of destructive deletion where appropriate.

---

# 14. Production Requirements

The final SQL should be:

* PostgreSQL/Supabase compatible
* Safe to run as a migration
* Properly ordered
* Idempotent where practical
* Secure against client-side privilege escalation
* Designed for real authenticated users
* Designed for real doctor–patient communication
* Suitable for Supabase Realtime
* Free of mock users and bot simulations

Do not silently remove existing functionality.

If a schema change is required, explain why.

---

# 15. Output

Produce the complete updated migration SQL.

Structure it clearly into sections:

```text
Extensions
Profiles
Patient Profiles
Doctor Profiles
Doctor Availability
Schedule Exceptions
Appointments
Conversations
Conversation Participants
Messages
Notifications
Audit Logs
Functions
Triggers
RLS
RLS Helper Functions
Indexes
Realtime Configuration
```

After the SQL, provide a concise explanation of:

1. What security vulnerabilities were fixed
2. How role management now works
3. How doctor–patient messaging works
4. How RLS prevents unauthorized access
5. How appointment double-booking is prevented
6. How Supabase Realtime should connect to the messaging system

The result should represent a **real doctor–patient platform**, not a demo or bot simulation.
