'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/auth-context';
import type { DoctorProfile, AvailableSlot } from '@/lib/services/doctor-service';
import { apiFetch } from '@/lib/api-client';

// ─── Specialty Icons ─────────────────────────────────────────────────────────
const SPECIALTY_ICONS: Record<string, string> = {
  Cardiology: '♥',
  Dermatology: '✦',
  Neurology: '⬡',
  'Internal Medicine': '✚',
  Orthopedics: '⌀',
  Pediatrics: '◈',
  Psychiatry: '◯',
  Oncology: '◉',
  default: '◇',
};

const SPECIALTIES = [
  'All',
  'Cardiology',
  'Dermatology',
  'Neurology',
  'Internal Medicine',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function getTodayAndNext6(): string[] {
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

// ─── Doctor Card ──────────────────────────────────────────────────────────────
function DoctorCard({
  doctor,
  onBook,
}: {
  doctor: DoctorProfile;
  onBook: (doctor: DoctorProfile) => void;
}) {
  const icon = SPECIALTY_ICONS[doctor.specialization] ?? SPECIALTY_ICONS.default;

  return (
    <div
      style={{
        background: 'var(--surface-elevated)',
        border: '1px solid var(--triage-border)',
        borderRadius: '14px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        transition: 'border-color 0.2s ease, transform 0.15s ease',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--clinical-mint)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--triage-border)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            background: 'rgba(0, 214, 150, 0.1)',
            border: '1px solid rgba(0, 214, 150, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            flexShrink: 0,
            color: 'var(--clinical-mint)',
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: '1rem',
              color: '#e8edf5',
              marginBottom: '0.2rem',
            }}
          >
            {doctor.name}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: 'var(--clinical-mint)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            {doctor.specialization}
          </div>
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            color: 'rgba(0, 214, 150, 0.7)',
            background: 'rgba(0, 214, 150, 0.08)',
            border: '1px solid rgba(0, 214, 150, 0.2)',
            borderRadius: '6px',
            padding: '0.25rem 0.5rem',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          VERIFIED ✓
        </div>
      </div>

      {/* Bio */}
      {doctor.bio && (
        <p
          style={{
            fontSize: '0.83rem',
            color: 'rgba(200, 210, 228, 0.7)',
            lineHeight: 1.6,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {doctor.bio}
        </p>
      )}

      {/* Stats */}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        {doctor.experienceYears && (
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#e8edf5',
              }}
            >
              {doctor.experienceYears}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                color: 'rgba(200, 210, 228, 0.5)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Yrs Experience
            </div>
          </div>
        )}
        {doctor.consultationFee && (
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#e8edf5',
              }}
            >
              ${doctor.consultationFee}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                color: 'rgba(200, 210, 228, 0.5)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Consultation
            </div>
          </div>
        )}
      </div>

      {/* Book Button */}
      <button
        id={`book-btn-${doctor.id}`}
        onClick={() => onBook(doctor)}
        style={{
          width: '100%',
          padding: '0.7rem 1rem',
          background: 'rgba(0, 214, 150, 0.12)',
          border: '1px solid rgba(0, 214, 150, 0.4)',
          borderRadius: '9px',
          color: 'var(--clinical-mint)',
          fontSize: '0.85rem',
          fontWeight: 600,
          fontFamily: 'var(--font-sans)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          letterSpacing: '0.02em',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0, 214, 150, 0.22)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--clinical-mint)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0, 214, 150, 0.12)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0, 214, 150, 0.4)';
        }}
      >
        Book Appointment
      </button>
    </div>
  );
}

// ─── Booking Modal ─────────────────────────────────────────────────────────────
function BookingModal({
  doctor,
  onClose,
  onBooked,
}: {
  doctor: DoctorProfile;
  onClose: () => void;
  onBooked: (appointmentId: string) => void;
}) {
  const [selectedDate, setSelectedDate] = useState(getTodayAndNext6()[1]);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [reason, setReason] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedId, setConfirmedId] = useState('');
  const [error, setError] = useState('');
  const dates = getTodayAndNext6();

  useEffect(() => {
    setSlotsLoading(true);
    setSelectedSlot(null);
    setError('');
    apiFetch(`/api/doctors?doctor_id=${doctor.id}&availability=true&date=${selectedDate}`)
      .then(r => r.json())
      .then(d => {
        setSlots(d.slots ?? []);
        setSlotsLoading(false);
      })
      .catch(() => {
        setSlots([]);
        setSlotsLoading(false);
      });
  }, [doctor.id, selectedDate]);

  const handleBook = async () => {
    if (!selectedSlot) return;
    setConfirming(true);
    setError('');
    try {
      const res = await apiFetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor_id: doctor.id,
          scheduled_start: selectedSlot.scheduledStart,
          scheduled_end: selectedSlot.scheduledEnd,
          reason: reason || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errorMessages: Record<string, string> = {
          SLOT_UNAVAILABLE: 'That slot was just taken. Please choose another time.',
          UNAUTHENTICATED: 'Please log in to book an appointment.',
          UNAUTHORIZED: 'Your account is not authorized for this action.',
          DOCTOR_NOT_VERIFIED: 'This doctor is not currently verified for bookings.',
        };
        setError(errorMessages[data.error] ?? data.error ?? 'Booking failed. Please try again.');
        setConfirming(false);
        return;
      }
      const apptId = data.appointment?.appointmentId ?? data.appointment?.id ?? 'confirmed';
      setConfirmedId(apptId);
      setConfirmed(true);
      onBooked(apptId);
    } catch {
      setError('A network error occurred. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div
      id="booking-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(8, 12, 22, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: 'var(--surface-elevated)',
          border: '1px solid var(--triage-border)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '540px',
          maxHeight: '90vh',
          overflow: 'auto',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {confirmed ? (
          /* ── Confirmation View ── */
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e8edf5', marginBottom: '0.5rem' }}>
              Appointment Confirmed
            </div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(200,210,228,0.7)', marginBottom: '0.25rem' }}>
              {doctor.name} · {formatDate(selectedDate)}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                color: 'var(--clinical-mint)',
                marginBottom: '0.5rem',
              }}
            >
              {selectedSlot?.displayTime}
            </div>
            {confirmedId && (
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  color: 'rgba(0,214,150,0.6)',
                  marginBottom: '1.5rem',
                }}
              >
                ID: {confirmedId}
              </div>
            )}
            <p style={{ fontSize: '0.82rem', color: 'rgba(200,210,228,0.6)', lineHeight: 1.6 }}>
              A notification has been sent to you and your doctor.
              You can view this appointment in your dashboard.
            </p>
            <button
              onClick={onClose}
              style={{
                marginTop: '1.5rem',
                padding: '0.7rem 2rem',
                background: 'rgba(0,214,150,0.15)',
                border: '1px solid rgba(0,214,150,0.4)',
                borderRadius: '9px',
                color: 'var(--clinical-mint)',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#e8edf5' }}>
                  Book with {doctor.name}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    color: 'var(--clinical-mint)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginTop: '0.25rem',
                  }}
                >
                  {doctor.specialization}
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(200,210,228,0.5)',
                  fontSize: '1.3rem',
                  cursor: 'pointer',
                  lineHeight: 1,
                  padding: '0.25rem',
                }}
              >
                ✕
              </button>
            </div>

            {/* ── Date Picker ── */}
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  color: 'rgba(200,210,228,0.5)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '0.75rem',
                }}
              >
                Select Date
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {dates.map(d => (
                  <button
                    key={d}
                    onClick={() => setSelectedDate(d)}
                    style={{
                      padding: '0.5rem 0.9rem',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: selectedDate === d ? 'var(--clinical-mint)' : 'var(--triage-border)',
                      background: selectedDate === d ? 'rgba(0,214,150,0.12)' : 'transparent',
                      color: selectedDate === d ? 'var(--clinical-mint)' : 'rgba(200,210,228,0.6)',
                      fontSize: '0.78rem',
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {formatDate(d)}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Time Slots ── */}
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  color: 'rgba(200,210,228,0.5)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '0.75rem',
                }}
              >
                Available Times
              </div>
              {slotsLoading ? (
                <div style={{ color: 'rgba(200,210,228,0.4)', fontSize: '0.85rem' }}>Loading slots…</div>
              ) : slots.length === 0 ? (
                <div
                  style={{
                    color: 'rgba(200,210,228,0.35)',
                    fontSize: '0.85rem',
                    fontStyle: 'italic',
                  }}
                >
                  No available slots for this date.
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
                    gap: '0.5rem',
                  }}
                >
                  {slots.map(slot => (
                    <button
                      key={slot.slotId}
                      onClick={() => setSelectedSlot(slot)}
                      style={{
                        padding: '0.55rem 0.4rem',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor:
                          selectedSlot?.slotId === slot.slotId
                            ? 'var(--clinical-mint)'
                            : 'var(--triage-border)',
                        background:
                          selectedSlot?.slotId === slot.slotId
                            ? 'rgba(0,214,150,0.12)'
                            : 'transparent',
                        color:
                          selectedSlot?.slotId === slot.slotId
                            ? 'var(--clinical-mint)'
                            : 'rgba(200,210,228,0.6)',
                        fontSize: '0.78rem',
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s',
                      }}
                    >
                      {slot.displayTime}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Reason ── */}
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  color: 'rgba(200,210,228,0.5)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '0.75rem',
                }}
              >
                Reason for Visit (optional)
              </div>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Brief reason or symptoms…"
                rows={2}
                style={{
                  width: '100%',
                  background: 'var(--surface-base)',
                  border: '1px solid var(--triage-border)',
                  borderRadius: '9px',
                  padding: '0.75rem 1rem',
                  color: '#e8edf5',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-sans)',
                  resize: 'vertical',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* ── Error ── */}
            {error && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  background: 'rgba(230,70,70,0.1)',
                  border: '1px solid rgba(230,70,70,0.3)',
                  borderRadius: '9px',
                  color: '#f08080',
                  fontSize: '0.85rem',
                }}
              >
                {error}
              </div>
            )}

            {/* ── Confirm Button ── */}
            <button
              id="confirm-booking-btn"
              onClick={handleBook}
              disabled={!selectedSlot || confirming}
              style={{
                padding: '0.85rem 1.5rem',
                background:
                  selectedSlot && !confirming
                    ? 'rgba(0,214,150,0.18)'
                    : 'rgba(0,214,150,0.06)',
                border: '1px solid',
                borderColor:
                  selectedSlot && !confirming
                    ? 'rgba(0,214,150,0.6)'
                    : 'rgba(0,214,150,0.15)',
                borderRadius: '10px',
                color:
                  selectedSlot && !confirming
                    ? 'var(--clinical-mint)'
                    : 'rgba(0,214,150,0.3)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: selectedSlot && !confirming ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              {confirming ? (
                <>
                  <span
                    style={{
                      width: '14px',
                      height: '14px',
                      border: '2px solid rgba(0,214,150,0.4)',
                      borderTopColor: 'var(--clinical-mint)',
                      borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  Booking…
                </>
              ) : selectedSlot ? (
                `Confirm — ${formatDate(selectedDate)} at ${selectedSlot.displayTime}`
              ) : (
                'Select a time slot to continue'
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function DoctorAvailabilityPanel() {
  const [rows, setRows] = useState<Array<{ id: string; day_of_week: number; start_time: string; end_time: string }>>([]);
  const [appointments, setAppointments] = useState<Array<{ id: string; patientName?: string; scheduledStart: string; status: string }>>([]);
  const [day, setDay] = useState('1');
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('17:00');
  const [message, setMessage] = useState('');

  const load = () => Promise.all([
    apiFetch('/api/doctor/availability').then((r) => r.json()),
    apiFetch('/api/appointments?view=doctor').then((r) => r.json()),
  ]).then(([availability, appointmentData]) => { setRows(availability.availability ?? []); setAppointments(appointmentData.appointments ?? []); });
  useEffect(() => { load(); }, []);
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await apiFetch('/api/doctor/availability', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ day_of_week: Number(day), start_time: start, end_time: end }) });
    const data = await response.json();
    setMessage(response.ok ? 'Availability saved.' : (data.error ?? 'Unable to save availability.'));
    if (response.ok) load();
  };
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return <main className="mx-auto max-w-5xl space-y-6 px-4 py-10 text-white">
    <div><p className="font-mono text-xs uppercase text-clinical-mint">Doctor workspace</p><h1 className="text-3xl font-bold">Availability and appointments</h1><p className="mt-2 text-sm text-gray-400">Set the time windows patients can book. Your appointments and patient names are shown in the chat workspace.</p></div>
    <form onSubmit={save} className="surface-elevated grid gap-3 rounded-xl border border-triage-border p-5 sm:grid-cols-4">
      <label className="text-sm text-gray-300">Day<select value={day} onChange={(e) => setDay(e.target.value)} className="mt-1 w-full rounded border border-triage-border bg-surface-base p-2"><>{weekdays.map((name, i) => <option key={name} value={i}>{name}</option>)}</></select></label>
      <label className="text-sm text-gray-300">Start<input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="mt-1 w-full rounded border border-triage-border bg-surface-base p-2" /></label>
      <label className="text-sm text-gray-300">End<input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="mt-1 w-full rounded border border-triage-border bg-surface-base p-2" /></label>
      <button className="self-end rounded bg-clinical-mint p-2 font-semibold text-surface-base">Save availability</button>
      {message && <p className="text-sm text-clinical-mint sm:col-span-4">{message}</p>}
    </form>
    <section className="surface-elevated rounded-xl border border-triage-border p-5"><h2 className="mb-4 font-semibold">Saved availability</h2>{rows.length === 0 ? <p className="text-sm text-gray-400">No availability configured yet.</p> : <div className="space-y-2">{rows.map((row) => <div key={row.id} className="flex items-center justify-between rounded border border-triage-border p-3 text-sm"><span>{weekdays[row.day_of_week]} · {row.start_time.slice(0, 5)}–{row.end_time.slice(0, 5)}</span><button onClick={async () => { await apiFetch(`/api/doctor/availability?id=${row.id}`, { method: 'DELETE' }); load(); }} className="text-rose-300">Remove</button></div>)}</div>}</section>
    <section className="surface-elevated rounded-xl border border-triage-border p-5"><h2 className="mb-4 font-semibold">Patient appointments</h2>{appointments.length === 0 ? <p className="text-sm text-gray-400">No appointments assigned yet.</p> : <div className="space-y-2">{appointments.map((appointment) => <div key={appointment.id} className="flex items-center justify-between rounded border border-triage-border p-3 text-sm"><span><strong>{appointment.patientName ?? 'Patient'}</strong> · {new Date(appointment.scheduledStart).toLocaleString()}</span><span className="text-xs uppercase text-clinical-mint">{appointment.status}</span></div>)}</div>}</section>
  </main>;
}

// ─── Patient directory page ──────────────────────────────────────────────────
function PatientDoctorsPage() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [search, setSearch] = useState('');
  const [bookingDoctor, setBookingDoctor] = useState<DoctorProfile | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    setLoading(true);
    const spec = selectedSpecialty === 'All' ? '' : `?specialization=${encodeURIComponent(selectedSpecialty)}`;
    apiFetch(`/api/doctors${spec}`)
      .then(r => r.json())
      .then(d => {
        setDoctors(d.doctors ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedSpecialty]);

  const filtered = doctors.filter(d =>
    search.trim() === '' ||
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization.toLowerCase().includes(search.toLowerCase())
  );

  const handleBooked = (appointmentId: string) => {
    setToastMsg(`Appointment confirmed! ID: ${appointmentId}`);
    setTimeout(() => setToastMsg(''), 5000);
  };

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes toastIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <Navbar />

      <main
        style={{
          paddingTop: '72px',
          minHeight: '100vh',
          background: 'var(--surface-base)',
          color: '#c8d2e4',
          fontFamily: 'var(--font-sans)',
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            borderBottom: '1px solid var(--triage-border)',
            background: 'var(--surface-elevated)',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem 2rem' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: 'var(--clinical-mint)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              Doctor Directory
            </div>
            <h1
              style={{
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 700,
                color: '#e8edf5',
                margin: '0 0 0.5rem',
              }}
            >
              Find & Book Verified Doctors
            </h1>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(200,210,228,0.6)', maxWidth: '520px' }}>
              Every doctor listed here is verified by our clinical team. Book a real appointment that persists to your account.
            </p>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          {/* ── Filters ── */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              alignItems: 'center',
              marginBottom: '2rem',
            }}
          >
            {/* Search */}
            <input
              id="doctor-search"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or specialty…"
              style={{
                flex: '1 1 240px',
                padding: '0.65rem 1rem',
                background: 'var(--surface-elevated)',
                border: '1px solid var(--triage-border)',
                borderRadius: '10px',
                color: '#e8edf5',
                fontSize: '0.875rem',
                outline: 'none',
                fontFamily: 'var(--font-sans)',
              }}
            />

            {/* Specialty Filters */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {SPECIALTIES.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSpecialty(s)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor:
                      selectedSpecialty === s ? 'var(--clinical-mint)' : 'var(--triage-border)',
                    background:
                      selectedSpecialty === s ? 'rgba(0,214,150,0.1)' : 'transparent',
                    color:
                      selectedSpecialty === s
                        ? 'var(--clinical-mint)'
                        : 'rgba(200,210,228,0.55)',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    transition: 'all 0.15s',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* ── Doctor Grid ── */}
          {loading ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '4rem',
                color: 'rgba(200,210,228,0.35)',
                fontSize: '0.9rem',
              }}
            >
              Loading doctors…
            </div>
          ) : filtered.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '4rem',
                color: 'rgba(200,210,228,0.35)',
                fontSize: '0.9rem',
              }}
            >
              No verified doctors found{search ? ` for "${search}"` : ''}.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {filtered.map(d => (
                <DoctorCard key={d.id} doctor={d} onBook={setBookingDoctor} />
              ))}
            </div>
          )}

          {/* ── Result Count ── */}
          {!loading && filtered.length > 0 && (
            <div
              style={{
                marginTop: '2rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: 'rgba(200,210,228,0.35)',
                textAlign: 'center',
                letterSpacing: '0.05em',
              }}
            >
              {filtered.length} verified doctor{filtered.length !== 1 ? 's' : ''} · Supabase-backed real-time data
            </div>
          )}
        </div>
      </main>

      {/* ── Booking Modal ── */}
      {bookingDoctor && (
        <BookingModal
          doctor={bookingDoctor}
          onClose={() => setBookingDoctor(null)}
          onBooked={id => { handleBooked(id); setBookingDoctor(null); }}
        />
      )}

      {/* ── Toast Notification ── */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            background: 'rgba(0,214,150,0.15)',
            border: '1px solid rgba(0,214,150,0.5)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            color: 'var(--clinical-mint)',
            fontSize: '0.85rem',
            fontWeight: 600,
            zIndex: 2000,
            maxWidth: '340px',
            animation: 'toastIn 0.25s ease',
            backdropFilter: 'blur(8px)',
          }}
        >
          ✅ {toastMsg}
        </div>
      )}
    </>
  );
}

export default function DoctorsPage() {
  const { user, loading } = useAuth();
  if (loading) return <main className="p-10 text-center text-gray-400">Loading workspace…</main>;
  return user?.role === 'doctor' ? <DoctorAvailabilityPanel /> : <PatientDoctorsPage />;
}
