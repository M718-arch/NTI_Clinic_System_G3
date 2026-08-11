# Receptionist Portal — React Components

Matches the MediGlass Portal mockups (`Clinical Clarity Glass` design
system) and wires up to the Phase 5 Laravel backend.

## Files

```
api/receptionistApi.js                    — fetch wrapper for all /api/receptionist/* endpoints
styles/receptionist-theme.css              — design tokens + component classes from DESIGN.md
components/receptionist/
  ReceptionistLayout.jsx                   — sidebar + header shell (wraps all pages)
  Dashboard.jsx                            — stats, today's highlights, doctor availability
  Patients.jsx                             — All / Pending Approval / Search tabs, approve/reject
  WalkInRegistration.jsx                   — walk-in patient intake form
  TodaySchedule.jsx                        — today's appointments, check-in/cancel
  BookAppointment.jsx                      — 3-step booking flow with summary sidebar
  Settings.jsx                             — profile + password
```

Drop these into your existing `src/` tree (adjust the relative import
paths in each file if your folder structure differs).

## Wiring into your router

Assumes React Router v6. Example:

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ReceptionistLayout from './components/receptionist/ReceptionistLayout';
import Dashboard from './components/receptionist/Dashboard';
import Patients from './components/receptionist/Patients';
import WalkInRegistration from './components/receptionist/WalkInRegistration';
import TodaySchedule from './components/receptionist/TodaySchedule';
import BookAppointment from './components/receptionist/BookAppointment';
import Settings from './components/receptionist/Settings';

function App() {
  const { token, user } = useAuth(); // however your app currently exposes these

  return (
    <BrowserRouter>
      <Routes>
        {/* ...your existing doctor/patient/admin routes... */}

        <Route path="/receptionist" element={<ReceptionistLayout user={user} />}>
          <Route index element={<Dashboard token={token} userName={user?.name} />} />
          <Route path="patients" element={<Patients token={token} />} />
          <Route path="patients/walk-in" element={<WalkInRegistration token={token} />} />
          <Route path="schedule" element={<TodaySchedule token={token} />} />
          <Route path="book" element={<BookAppointment token={token} />} />
          <Route path="settings" element={<Settings token={token} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

Every page/component takes a `token` prop — the Sanctum bearer token
from `AuthenticatedSessionController::store`'s response. How you store
that (React context, a state manager, a cookie) is up to your existing
auth setup; these components don't read from `localStorage` themselves
so they'll work with whatever you're already doing.

## What's simplified vs. the mockups (per our last exchange)

- **No insurance fields** — `Patient` has no insurance columns. Add a
  migration (`insurance_provider`, `insurance_id`) + the matching form
  fields in `WalkInRegistration.jsx` if/when you want this.
- **Single `address` field**, not Street/City/State/ZIP — same reasoning.
- **Check-in is binary** (checked in / not), not the mockup's
  Waiting → In Consult → Room N flow. That needs a real queue/room data
  model — deferred to Phase 8 (Queue Management) per the roadmap.
- **Doctor availability is boolean** (Available/Unavailable from
  `doctors.status`), not the mockup's three-state Available/In Consult/
  Away, since there's no real-time doctor status field yet.
- **Billing stat is a placeholder** (`—`) since Phase 6 doesn't exist.
- **Settings** only has Profile + Password — the mockup's Notifications
  tab isn't backed by anything for receptionists yet (doctors have
  notification preferences; receptionists don't).

## Fonts

`DESIGN.md` specifies Plus Jakarta Sans (headings) and Inter (body).
Neither is loaded by `receptionist-theme.css` — add them via your
existing font pipeline, e.g.:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700&display=swap" rel="stylesheet">
```

## Not yet built

- Mobile hamburger toggle wiring — the CSS/markup for a collapsible
  sidebar is in place (`.mg-sidebar.open`), but the header's menu
  button is hidden (`display: none`) pending a decision on breakpoint
  behavior for your actual app shell.
- Toast notifications use inline error banners for now rather than the
  `.mg-toast` class defined in the CSS — wire up a toast if you have a
  global one already.
