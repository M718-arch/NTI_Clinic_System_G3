<?php
// app/Http/Controllers/Api/Admin/ReportController.php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Service;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        try {
            Log::info('ReportController::index started');
            
            $monthStart = now()->startOfMonth()->toDateString();
            $monthEnd = now()->endOfMonth()->toDateString();

            Log::info('Month range: ' . $monthStart . ' to ' . $monthEnd);

            // Test each query individually
            try {
                $doctorCount = Doctor::count();
                Log::info('Doctor count: ' . $doctorCount);
            } catch (\Exception $e) {
                Log::error('Doctor count error: ' . $e->getMessage());
                $doctorCount = 0;
            }

            try {
                $patientCount = Patient::count();
                Log::info('Patient count: ' . $patientCount);
            } catch (\Exception $e) {
                Log::error('Patient count error: ' . $e->getMessage());
                $patientCount = 0;
            }

            try {
                $bookingCount = Booking::count();
                Log::info('Booking count: ' . $bookingCount);
            } catch (\Exception $e) {
                Log::error('Booking count error: ' . $e->getMessage());
                $bookingCount = 0;
            }

            try {
                $serviceCount = Service::count();
                Log::info('Service count: ' . $serviceCount);
            } catch (\Exception $e) {
                Log::error('Service count error: ' . $e->getMessage());
                $serviceCount = 0;
            }

            // Appointment status
            try {
                $pendingCount = Booking::where('status', 'pending')->count();
                $confirmedCount = Booking::where('status', 'confirmed')->count();
                $completedCount = Booking::where('status', 'completed')->count();
                $cancelledCount = Booking::where('status', 'cancelled')->count();
                Log::info('Status counts: pending=' . $pendingCount . ', confirmed=' . $confirmedCount . ', completed=' . $completedCount . ', cancelled=' . $cancelledCount);
            } catch (\Exception $e) {
                Log::error('Status counts error: ' . $e->getMessage());
                $pendingCount = $confirmedCount = $completedCount = $cancelledCount = 0;
            }

            // Revenue
            try {
                $totalRevenue = (float) Invoice::where('status', 'paid')->sum('amount');
                $outstandingRevenue = (float) Invoice::where('status', 'pending')->sum('amount');
                Log::info('Revenue: total=' . $totalRevenue . ', outstanding=' . $outstandingRevenue);
            } catch (\Exception $e) {
                Log::error('Revenue error: ' . $e->getMessage());
                $totalRevenue = 0;
                $outstandingRevenue = 0;
            }

            // Monthly revenue
            try {
                $monthlyRevenue = $this->monthlyRevenue();
                Log::info('Monthly revenue count: ' . count($monthlyRevenue));
            } catch (\Exception $e) {
                Log::error('Monthly revenue error: ' . $e->getMessage());
                $monthlyRevenue = [];
            }

            // Top doctors
            try {
                $topDoctors = $this->topDoctors(5);
                Log::info('Top doctors count: ' . count($topDoctors));
            } catch (\Exception $e) {
                Log::error('Top doctors error: ' . $e->getMessage());
                $topDoctors = [];
            }

            // Top services
            try {
                $topServices = $this->topServices(5);
                Log::info('Top services count: ' . count($topServices));
            } catch (\Exception $e) {
                Log::error('Top services error: ' . $e->getMessage());
                $topServices = [];
            }

            // Patients this month
            try {
                $patientsThisMonth = $this->newVsReturningPatients($monthStart, $monthEnd);
                Log::info('Patients this month: new=' . $patientsThisMonth['new'] . ', returning=' . $patientsThisMonth['returning']);
            } catch (\Exception $e) {
                Log::error('Patients this month error: ' . $e->getMessage());
                $patientsThisMonth = ['new' => 0, 'returning' => 0, 'range' => ['from' => $monthStart, 'to' => $monthEnd]];
            }

            Log::info('ReportController::index completed successfully');

            return response()->json([
                'totals' => [
                    'doctors' => $doctorCount,
                    'patients' => $patientCount,
                    'appointments' => $bookingCount,
                    'services' => $serviceCount,
                ],

                'appointment_status' => [
                    'pending' => $pendingCount,
                    'confirmed' => $confirmedCount,
                    'completed' => $completedCount,
                    'cancelled' => $cancelledCount,
                ],

                'revenue' => [
                    'total' => $totalRevenue,
                    'outstanding' => $outstandingRevenue,
                    'monthly' => $monthlyRevenue,
                ],

                'top_doctor' => $topDoctors->first() ?? null,
                'top_doctors' => $topDoctors,

                'top_service' => $topServices->first() ?? null,
                'top_services' => $topServices,

                'patients_this_month' => $patientsThisMonth,
            ]);

        } catch (\Exception $e) {
            Log::error('ReportController fatal error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'message' => 'Error generating report: ' . $e->getMessage(),
                'error' => $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTraceAsString() : null
            ], 500);
        }
    }
    /**
     * Overview method - called by the API route /admin/reports/overview
     */
    public function overview(Request $request)
    {
        return $this->index($request);
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
                'amount' => (float) Invoice::where('status', 'paid')
                    ->whereYear('paid_at', $month->year)
                    ->whereMonth('paid_at', $month->month)
                    ->sum('amount'),
            ];
        })->values();
    }

    /**
     * Doctors ranked by number of bookings on their services.
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
     * New vs. returning patients within a date range.
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