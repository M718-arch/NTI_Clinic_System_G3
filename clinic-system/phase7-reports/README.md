# Phase 7 — Reports (Backend)

## Where each file goes

| File | Destination |
|---|---|
| `controllers/Admin/ReportController.php` | `app/Http/Controllers/Api/Admin/ReportController.php` (new — note the `Api\Admin` namespace, not `Admin`; see below) |
| `api.php` | `routes/api.php` (overwrite — adds one route) |

Single new endpoint: **`GET /api/admin/reports/overview`**

```json
{
  "totals": { "doctors": 12, "patients": 340, "appointments": 812, "services": 28 },
  "appointment_status": { "pending": 14, "confirmed": 22, "completed": 760, "cancelled": 16 },
  "revenue": {
    "total": 48250.00,
    "outstanding": 1240.00,
    "monthly": [{ "label": "Mar 2026", "amount": 6100.00 }, ...]
  },
  "top_doctor": { "id": 3, "name": "Dr. Sarah Smith", "specialization": "Cardiology", "bookings_total": 142 },
  "top_doctors": [ /* top 5, same shape */ ],
  "top_service": { "id": 7, "name": "Annual Checkup", "doctor_name": "Dr. Sarah Smith", "bookings_count": 88 },
  "top_services": [ /* top 5, same shape */ ],
  "patients_this_month": { "range": { "from": "2026-08-01", "to": "2026-08-31" }, "new": 24, "returning": 61 }
}
```

## Why a new controller instead of extending the existing one

You already have `App\Http\Controllers\Admin\ReportController` (Blade,
web route, `admin.reports.index` view). I left that one untouched —
don't know what its Blade template expects, and breaking a working page
wasn't worth it. This is a separate JSON endpoint for a JS/React admin
dashboard to consume.

Two things this version has that the Blade one doesn't, because they
didn't exist when that one was written:
- **Real revenue** — via the `Invoice` model from Phase 6.
- **New vs. Returning Patients** — the roadmap's Phase 7 lists this;
  defined here as "booked in this range" vs. "booked in this range AND
  had at least one earlier booking." Counts by booking activity, not
  `Patient.approval_status`, since that's the more useful signal for a
  growth/front-desk report.

## Overlap with Billing (Phase 6) — intentional

`revenue.total` / `revenue.outstanding` / `revenue.monthly` here
duplicate `Api\Admin\BillingController::summary()`. Kept both because
the roadmap explicitly lists Revenue and Monthly Revenue under *both*
Billing and Reports — Billing's version is the finance-focused endpoint,
this one is the operational report that happens to include revenue
alongside doctors/patients/appointments. If that duplication bothers
you, the simplest fix is to have this endpoint call
`BillingController::summary()` internally instead of recomputing — I
kept them independent for now so each controller stays self-contained.

## Note on the existing namespace inconsistency

Flagged this back in Phase 5: your `api.php` imports admin controllers
from `App\Http\Controllers\Api\Admin\*`, but the `DoctorController` /
`PatientController` code you originally shared declared
`namespace App\Http\Controllers\Admin;` (no `Api`). This new
`ReportController` follows the `Api\Admin` convention (matching what
`api.php` actually imports), consistent with `ReceptionistController`
and `BillingController` from Phases 5–6. Still worth checking whether
your actual Doctor/Patient admin controller files have this same
mismatch — I can't verify without seeing them directly.
