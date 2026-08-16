# Medical Platform Role Rules

This project is medical-only. Retail, shopping, SaaS, orders, subscriptions, and non-medical RAG content must not be exposed.

## Patients

- Browse verified doctors.
- Book appointments only from slots created by the selected doctor.
- View their own appointments and support tickets.
- Use doctor-patient communication after an appointment relationship exists.
- Must not access the clinical knowledge/RAG management area.
- Must not create appointments outside a doctor's configured availability.

## Doctors

- Configure recurring availability by weekday and time range.
- See assigned appointments with the patient's real name.
- Communicate with appointed patients.
- Must not create support tickets or book appointments as a doctor.
- Must not book themselves or another doctor; a separate patient account is required.
- Manage approved medical knowledge/RAG content.

## Database and AI

- Availability is stored by doctor profile ID and enforced by database validation.
- Appointment booking is authenticated through Supabase and constrained by availability.
- Realtime doctor-patient chat uses explicit participants and RLS.
- n8n support conversations use separate medical support tables.
- Gemini/n8n support responses must remain medical-only and must not expose secrets or unrelated domain content.
