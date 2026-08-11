<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class BillingController extends Controller
{
    /**
     * Revenue overview per the roadmap ("Admin Can: View Revenue,
     * Financial Reports, Outstanding Payments, Paid Invoices").
     */
    public function summary()
    {
        $totalRevenue = Invoice::paid()->sum('amount');
        $outstanding = Invoice::pending()->sum('amount');
        $outstandingCount = Invoice::pending()->count();
        $paidCount = Invoice::paid()->count();

        $months = collect(range(5, 0))->map(fn ($i) => Carbon::now()->subMonths($i)->startOfMonth());

        $monthlyRevenue = $months->map(function (Carbon $month) {
            return [
                'label' => $month->format('M Y'),
                'amount' => (float) Invoice::paid()
                    ->whereYear('paid_at', $month->year)
                    ->whereMonth('paid_at', $month->month)
                    ->sum('amount'),
            ];
        });

        return response()->json([
            'total_revenue' => (float) $totalRevenue,
            'outstanding_amount' => (float) $outstanding,
            'outstanding_count' => $outstandingCount,
            'paid_count' => $paidCount,
            'monthly_revenue' => $monthlyRevenue,
        ]);
    }

    /**
     * Invoice list for the admin billing screen. Filters: ?status=,
     * ?doctor_id=, ?from=, ?to= (created_at date range).
     */
    public function invoices(Request $request)
    {
        $query = Invoice::with(['patient.user', 'doctor.user'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('doctor_id')) {
            $query->where('doctor_id', $request->doctor_id);
        }

        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->from);
        }

        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->to);
        }

        return response()->json($query->paginate(25));
    }
}
