Critical
n8n and Supabase chat schemas still do not match
The existing chat tables use:
conversations.id
conversations.patient_id
conversations.doctor_id
messages.sender_id
messages.content
But the n8n workflow expects:
conversations.conversation_id
conversations.user_id
messages.user_id
messages.role
messages.message
Therefore, n8n chat execution will still fail.
Doctor registration is currently disabled by security changes
New users are forced to patient, which is correct for security, but there is no admin workflow yet to promote a user to doctor and create their doctor_profiles record.
Appointment validation is incomplete
Missing:
scheduled_end > scheduled_start constraint
Doctor availability time validation
Multiple availability periods per day
Availability overlap prevention
Strict appointment status transitions
Doctor working-hours validation during booking
Doctor-patient conversation security is incomplete
The current schema does not use the recommended conversation_participants table. Some existing conversation policies allow access based only on patient/doctor IDs instead of explicit appointment-based membership.
Important
Rerunning migration 002 removes all policies on its target tables
This makes it rerunnable, but if you run migration 002 after migration 005, the doctor-patient communication policy is removed until migration 005 is run again.
Existing doctor records may now be pending
The backfill changed doctors to pending. They will not appear as available until an admin verifies them.
Admin verification workflow is missing
There is no secure dashboard/API for admins to:
Verify doctors
Reject doctors
Suspend doctors
Promote users safely
Migration 007 relies on gen_random_uuid()
It should explicitly enable the pgcrypto extension or use the already-enabled UUID extension consistently.
n8n live connection is not verified
The database credential, webhook secret, Gemini credential, and Supabase connection still need a real end-to-end test.
Medical production requirements are incomplete
Still needed:
PHI audit review
Data retention rules
Monitoring and alerting
Encrypted backups
Incident response
Rate limiting
Admin activity auditing
Clinical safety review
HIPAA/legal compliance review