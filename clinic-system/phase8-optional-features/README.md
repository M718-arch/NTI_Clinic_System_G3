# Phase 8 — EMR, Queue Management, Prescriptions, Notifications, HL7 FHIR (Backend)

All five "optional/future" features from the roadmap, backend only.

## Where each file goes

| File | Destination |
|---|---|
| `migrations/*.php` (5) | `database/migrations/` |
| `models/Diagnosis.php`, `LabResult.php`, `RadiologyResult.php`, `Prescription.php` | `app/Models/` (new) |
| `models/Booking.php` | `app/Models/Booking.php` (overwrite — adds queue fields) |
| `controllers/Doctor/QueueController.php` | `app/Http/Controllers/Api/Doctor/QueueController.php` (new) |
| `controllers/Doctor/EmrController.php` | `app/Http/Controllers/Api/Doctor/EmrController.php` (new) |
| `controllers/Doctor/PrescriptionController.php` | `app/Http/Controllers/Api/Doctor/PrescriptionController.php` (new) |
| `controllers/Receptionist/AppointmentController.php` | `app/Http/Controllers/Api/Receptionist/AppointmentController.php` (overwrite — adds `sendToRoom`, check-in now sets `queue_status`) |
| `controllers/Admin/FhirController.php` | `app/Http/Controllers/Api/Admin/FhirController.php` (new) |
| `controllers/AppointmentController.php` | `app/Http/Controllers/Api/AppointmentController.php` (overwrite — see below) |
| `api.php` | `routes/api.php` (overwrite — adds every Phase 8 route) |

## Manual patches required

Same reasoning as Phase 6: I don't have reliable local copies of your
actual `MessageController.php` or (the non-Phase-6-patch parts of)
`PatientController.php`, so these are small patches to paste in, not
full files.

1. **`patches/PATCH_MessageController.php`** → add the notification-firing
   snippet to `MessageController::send()`. Fires "New Message" — but
   only when the receiver is a patient (see the patch's comment for why:
   the `Notification` table is patient-scoped, built in Phase 5 for
   appointment reschedules — doctor-facing message notifications would
   need a schema change).
2. **`patches/PATCH_PatientController_Phase8.php`** → add `emr()`,
   `prescriptions()`, `prescriptionDetail()` methods to `PatientController`
   (alongside the Phase 6 patch already there). Routes for these are
   already in `api.php`.

## What changed in `controllers/AppointmentController.php` — important

While wiring up "Appointment Booked/Approved/Cancelled" notifications I
found and fixed a **real pre-existing bug**, not something Phase 8
introduced: `cancel()` is bound to three different routes (patient
`/my-bookings/{booking}/cancel`, doctor `/bookings/{booking}/cancel`,
admin `/appointments/{booking}/cancel`) but only ever had
patient-authorization logic (`Patient::where('user_id', Auth::id())`).
A doctor or admin hitting their own cancel button has no matching
`Patient` row, so it always returned "Patient not found" (404) —
doctor/admin cancel has silently never worked. Fixed to branch by role,
the same pattern `updateStatus()` already used. Worth testing your
doctor and admin cancel flows after deploying this — if you were
relying on some other workaround, this changes that behavior.

Also added: `store()` fires "Appointment Booked", `accept()` fires
"Appointment Approved", `cancel()` fires "Appointment Cancelled" and
now also clears `queue_status` on cancel.

## Feature-by-feature summary

### Queue Management
`bookings` gains `queue_status` (waiting/in_consult/done), `room`,
`called_at`. Receptionist check-in now sets `queue_status = 'waiting'`.
Two ways to send a patient in: receptionist `sendToRoom()`, or the
doctor calling them from their own queue (`QueueController::call`).
`QueueController::index` returns the waiting list in arrival order
(exactly the roadmap's "1 Ahmed / 2 Sarah / 3 Mohamed" example) plus who's
currently in consult. `complete()` marks the booking `completed` and
clears the queue slot.

### EMR
`diagnoses`, `lab_results`, `radiology_results` tables — plus
prescriptions (its own module, included in the EMR read view too).
Doctor-write, patient-read. **No file upload endpoint** — `file_path`
exists on lab/radiology results for attaching a scanned report, but
wiring an actual upload route needs size/type-validation decisions this
phase had no direction on. Follow `DoctorController::uploadImage`'s
existing pattern if you want to add it. Visits = existing booking
history (not duplicated here); Allergies/Chronic Diseases = existing
plain-text `Patient` fields from earlier phases (not restructured).

### Prescriptions
`prescriptions` table: medicine/dose/frequency/duration/notes, doctor-write,
patient-read. Creating one fires a "Prescription Ready" notification.
"Patient downloads PDF" = same pattern as invoice receipts (Phase 6):
structured JSON for a printable view + browser `window.print()`, not a
server-rendered PDF — no PDF library confirmed installed.

### Notifications
Reuses the `notifications` table from Phase 5 (built for appointment
reschedules) rather than creating a new one. Five types now fire:
`appointment_booked`, `appointment_approved`, `appointment_cancelled`,
`new_message` (patients only, see patch note above), `prescription_ready`.
`PatientController::notifications()` needs no changes — it already reads
generically from the same table.

### HL7 FHIR export
Three read-only endpoints returning FHIR R4 JSON: `Patient`,
`Practitioner` (for Doctor), `Appointment` (for Booking). This is a
**data export in FHIR's shape**, not a certified FHIR server — no
search/history/Bundle endpoints, no SMART-on-FHIR auth. That matches
what the roadmap actually asks for ("Export Patient, Doctor, Appointment
as FHIR JSON"), not full conformance.

## Before running

1. `php artisan migrate`
2. Apply the two patches
3. Test doctor/admin cancel flows given the bugfix above
