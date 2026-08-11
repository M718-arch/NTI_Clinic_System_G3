<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DoctorInvoiceController extends Controller
{
    public function index(Request $request)
    {
        try {
            $doctor = $request->user()->doctor;

            if (!$doctor) {
                return response()->json(['message' => 'Doctor profile not found'], 404);
            }

            $invoices = Invoice::where('doctor_id', $doctor->id)
                ->with(['patient.user'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($invoice) {
                    $status = $invoice->status;
                    if ($status === 'pending' && $invoice->created_at->lt(now()->subDays(30))) {
                        $status = 'overdue';
                    }

                    return [
                        'id' => $invoice->id,
                        'invoice_number' => $invoice->invoice_number,
                        'patient' => [
                            'id' => $invoice->patient?->id,
                            'name' => $invoice->patient?->user?->name
                                ?? trim(($invoice->patient?->first_name ?? '') . ' ' . ($invoice->patient?->last_name ?? '')),
                        ],
                        'service' => $invoice->service_name,
                        'date' => $invoice->created_at?->format('Y-m-d'),
                        'amount' => (float) $invoice->amount,
                        'status' => $status,
                        'paid_at' => $invoice->paid_at?->format('Y-m-d'),
                        'payment_method' => $invoice->payment_method,
                    ];
                });

            return response()->json($invoices);
        } catch (\Exception $e) {
            Log::error('Doctor invoices index error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching invoices: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function stats(Request $request)
    {
        try {
            $doctor = $request->user()->doctor;

            if (!$doctor) {
                return response()->json(['message' => 'Doctor profile not found'], 404);
            }

            $base = Invoice::where('doctor_id', $doctor->id);

            $totalRevenue    = (clone $base)->where('status', 'paid')->sum('amount');
            $paidInvoices    = (clone $base)->where('status', 'paid')->count();
            $pendingPayments = (clone $base)->where('status', 'pending')->sum('amount');
            $overdueCount    = (clone $base)->where('status', 'pending')
                ->where('created_at', '<', now()->subDays(30))
                ->count();

            return response()->json([
                'totalRevenue'    => (float) $totalRevenue,
                'paidInvoices'    => $paidInvoices,
                'pendingPayments' => (float) $pendingPayments,
                'overdueCount'    => $overdueCount,
            ]);
        } catch (\Exception $e) {
            Log::error('Doctor payment stats error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching stats: ' . $e->getMessage(),
            ], 500);
        }
    }
}