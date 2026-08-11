# Admin Portal — React Components

Full admin portal, matching the same `Clinical Clarity Glass` design
system as the receptionist portal (same theme CSS, same toast provider).

## Files

```
api/adminApi.js                    — fetch wrapper for all admin endpoints
components/admin/
  AdminLayout.jsx                  — sidebar + header shell, nav covers every page below
  Dashboard.jsx                    — overview (reuses the Reports data)
  Doctors.jsx                      — list, create, edit, activate/deactivate, delete
  Patients.jsx                     — list, filter by approval status, edit, delete
  Receptionists.jsx                — list, create, edit, activate/deactivate, delete
  Appointments.jsx                 — all bookings, change status, cancel
  Billing.jsx                      — revenue summary + invoice list (view-only, per roadmap)
  Reports.jsx                      — Phase 7 dashboard (unchanged from before)

styles/receptionist-theme.css      — same theme file as the receptionist package
components/shared/ToastProvider.jsx — same as the receptionist package
```

## Wiring in

```jsx
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './components/admin/Dashboard';
import Doctors from './components/admin/Doctors';
import Patients from './components/admin/Patients';
import Receptionists from './components/admin/Receptionists';
import Appointments from './components/admin/Appointments';
import Billing from './components/admin/Billing';
import Reports from './components/admin/Reports';

<Route path="/admin" element={<AdminLayout user={user} token={token} onLoggedOut={() => { clearToken(); navigate('/login'); }} />}>
  <Route index element={<Dashboard token={token} />} />
  <Route path="doctors" element={<Doctors token={token} />} />
  <Route path="patients" element={<Patients token={token} />} />
  <Route path="receptionists" element={<Receptionists token={token} />} />
  <Route path="appointments" element={<Appointments token={token} />} />
  <Route path="billing" element={<Billing token={token} />} />
  <Route path="reports" element={<Reports token={token} />} />
</Route>
```

Same `token` prop convention as the receptionist components.

## Logout

`AdminLayout` didn't have a working logout at all before — the avatar
was a static image with no click handler. Now clicking it opens a
dropdown (name/email + Log Out). Requires two new props:

- `token` — same bearer token as everywhere else, needed to call `POST /api/logout`
- `onLoggedOut` — required callback, fires after the logout request completes
  (success or failure — see `UserMenu.jsx`'s comment for why it fires either way).
  This is where you clear your stored token and redirect to `/login`.

## Backend requirement: `GET /api/admin/specializations`

The Doctors page's create/edit form needs a specializations list — no
such admin endpoint existed anywhere in the codebase before now. Added
`Api\Admin\SpecializationController::index()` (read-only) — see the
Phase 8 backend zip for this file and its route. **You need that
endpoint deployed for the Doctors page to work.**

## Known gaps, called out rather than silently glossed over

- **Patients page can't change approval status.** `AdminPatientController::update`'s
  validated fields don't include `approval_status`, so there's no edit
  control for it here — approve/reject stays a receptionist-only action
  (Phase 5). If you want admin to be able to reverse a mistaken
  rejection, add `approval_status` to that controller's validation array
  first.
- **Doctor/Receptionist forms send empty optional fields as omitted, not
  `""`.** Laravel's `nullable` validation rule only skips validation for
  an actual `null`, not an empty string — sending `date_of_birth: ""`
  against `nullable|date` would 422. Both forms filter out blank fields
  before submitting to avoid this.
- **Billing is read-only for admin**, matching the roadmap's admin
  billing role (View Revenue / Financial Reports / Outstanding /
  Paid) — invoice creation stays receptionist-only (Phase 6).

## Not built

- No dedicated "create appointment" flow for admin — that's the
  receptionist's Book Appointment page (Phase 5). Admin only manages
  status/cancellation on existing bookings here.
- No FHIR export UI (Phase 8's HL7 FHIR feature) — see the main chat
  response for why that and the rest of Phase 8's frontend is being
  discussed separately rather than built blind.
