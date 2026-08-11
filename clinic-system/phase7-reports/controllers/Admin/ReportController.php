<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Service;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * Phase 7 — Reports.
 *
 * JSON counterpart to the existing Blade-based
 * App\Http\Controllers\Admin\ReportController (web route, renders
 * admin.reports.index). That one stays as-is for whatever server-rendered
 * page currently uses it; this one exists for a JS/React admin dashboard
 * to consume, and additionally covers two things the Blade version never
 * had: real revenue (via Invoice, which didn't exist when that
 * controller was written) and the New vs. Returning Patients metric the
 * roadmap asks for.
 *
 * Revenue/monthly-revenue numbers here overlap with
 * Api\Admin\BillingController::summary() — that's intentional. Billing's
 * summary is the finance-focused view (revenue, outstanding, paid
 * invoices); this endpoint is the operational report view (doctors,
 * patients, appointments, top performers) that happens to include
 * revenue because the roadmap explicitly lists it under Reports too.
 */
class ReportController extends Controller
{
    public function index(Request $request)
    {
        $monthStart = now()->startOfMonth()->toDateString();
        $monthEnd = now()->endOfMonth()->toDateString();

        return response()->json([
            'totals' => [
                'doctors' => Doctor::count(),
                'patients' => Patient::count(),
                'appointments' => Booking::count(),
                'services' => Service::count(),
            ],

            'appointment_status' => [
                'pending' => Booking::where('status', 'pending')->count(),
                'confirmed' => Booking::where('status', 'confirmed')->count(),
                'completed' => Booking::where('status', 'completed')->count(),
                'cancelled' => Booking::where('status', 'cancelled')->count(),
            ],

            'revenue' => [
                'total' => (float) Invoice::paid()->sum('amount'),
                'outstanding' => (float) Invoice::pending()->sum('amount'),
                'monthly' => $this->monthlyRevenue(),
            ],

            'top_doctor' => $this->topDoctors(1)->first(),
            'top_doctors' => $this->topDoctors(5),

            'top_service' => $this->topServices(1)->first(),
            'top_services' => $this->topServices(5),

            'patients_this_month' => $this->newVsReturningPatients($monthStart, $monthEnd),
        ]);
    }

    /**
     * Paid revenue for each of the last 6 months.
     */
    private function monthlyRevenue()
    {
        $months = collect(range(5, 0))->map(fn ($i) => Carbon::now()->subMonths($i)->startOfMonth());

        return $months->map(function (Carbon $month) {
            return [
                'label' => $month->format('M Y'),
                'amount' => (float) Invoice::paid()
                    ->whereYear('paid_at', $month->year)
                    ->whereMonth('paid_at', $month->month)
                    ->sum('amount'),
            ];
        })->values();
    }

    /**
     * Doctors ranked by number of bookings on their services.
     *
     * Uses `doctor->id` (not `doctor->user_id`) to match Service.doctor_id
     * — see the bugfix note in the original web ReportController; this
     * JSON version was written correctly from the start.
     */
    private function topDoctors(int $limit)
    {
        return Doctor::with(['user', 'specialization'])
            ->get()
            ->map(function ($doctor) {
                $count = Booking::whereHas('service', function ($q) use ($doctor) {
                    $q->where('doctor_id', $doctor->id);
                })->count();

                return [
                    'id' => $doctor->id,
                    'name' => $doctor->full_name ?: ($doctor->user->name ?? 'N/A'),
                    'specialization' => $doctor->specialization->name ?? 'General',
                    'bookings_total' => $count,
                ];
            })
            ->sortByDesc('bookings_total')
            ->take($limit)
            ->values();
    }

    /**
     * Services ranked by number of bookings.
     */
    private function topServices(int $limit)
    {
        return Service::withCount('bookings')
            ->with('doctor.user')
            ->orderByDesc('bookings_count')
            ->take($limit)
            ->get()
            ->map(function ($service) {
                return [
                    'id' => $service->id,
                    'name' => $service->name,
                    'doctor_name' => $service->doctor->full_name ?? ($service->doctor->user->name ?? 'N/A'),
                    'bookings_count' => $service->bookings_count,
                ];
            });
    }

    /**
     * New vs. returning patients within a date range (defaults to the
     * current month).
     *
     * "Active this range" = any patient with a booking whose date falls
     * in [$start, $end]. Of those, "returning" = has at least one other
     * booking dated before $start; the rest are "new".
     *
     * This counts by booking activity, not by Patient.approval_status —
     * a patient approved last month but booking for the first time this
     * month is "new" here, which is the more useful definition for a
     * front-desk/growth report than registration date would be.
     */
    private function newVsReturningPatients(string $start, string $end)
    {
        $activePatientIds = Booking::whereBetween('date', [$start, $end])
            ->pluck('patient_id')
            ->unique();

        $returningIds = Booking::whereIn('patient_id', $activePatientIds)
            ->where('date', '<', $start)
            ->distinct()
            ->pluck('patient_id');

        $returningCount = $returningIds->count();
        $newCount = $activePatientIds->count() - $returningCount;

        return [
            'range' => ['from' => $start, 'to' => $end],
            'new' => $newCount,
            'returning' => $returningCount,
        ];
    }
}
