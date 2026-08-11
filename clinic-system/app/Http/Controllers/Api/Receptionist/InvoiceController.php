<?php

namespace App\Http\Controllers\Api\Receptionist;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\Booking;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    /**
     * List invoices. Optional ?status= and ?patient_id= filters.
     * No revenue/report aggregation here — that's Admin-only per the
     * roadmap ("Receptionist Cannot: Access Financial Reports").
     */
    public function index(Request $request)
    {
        $query = Invoice::with(['patient.user', 'doctor.user', 'booking'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        return response()->json($query->get());
    }

    public function show(Invoice $invoice)
    {
        return response()->json($invoice->load(['patient.user', 'doctor.user', 'booking.service', 'createdBy']));
    }

    /**
     * Create an invoice. Can optionally be tied to a booking — if so,
     * the service name/doctor/amount are pre-filled from the booking's
     * service (still overridable, e.g. for a partial charge or add-on).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'booking_id' => 'nullable|exists:bookings,id',
            'service_name' => 'nullable|string|max:255',
            'amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
        ]);

        $doctorId = null;
        $serviceName = $validated['service_name'] ?? null;

        if (!empty($validated['booking_id'])) {
            $booking = Booking::with('service')->find($validated['booking_id']);
            if ($booking && $booking->patient_id !== (int) $validated['patient_id']) {
                return response()->json(['message' => 'That booking does not belong to this patient'], 422);
            }
            $doctorId = $booking?->service?->doctor_id;
            $serviceName = $serviceName ?? $booking?->service?->name;
        }

        $invoice = Invoice::create([
            'patient_id' => $validated['patient_id'],
            'booking_id' => $validated['booking_id'] ?? null,
            'doctor_id' => $doctorId,
            'service_name' => $serviceName,
            'amount' => $validated['amount'],
            'status' => 'pending',
            'notes' => $validated['notes'] ?? null,
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Invoice created successfully',
            'data' => $invoice->load(['patient.user', 'doctor.user'])
        ], 201);
    }

    public function markPaid(Request $request, Invoice $invoice)
    {
        if ($invoice->status === 'paid') {
            return response()->json(['message' => 'Invoice is already marked paid'], 400);
        }

        $validated = $request->validate([
            'payment_method' => 'nullable|string|max:50',
        ]);

        $invoice->update([
            'status' => 'paid',
            'paid_at' => now(),
            'payment_method' => $validated['payment_method'] ?? $invoice->payment_method,
        ]);

        return response()->json([
            'message' => 'Invoice marked as paid',
            'data' => $invoice->fresh()->load(['patient.user', 'doctor.user'])
        ]);
    }

    public function markPending(Invoice $invoice)
    {
        if ($invoice->status === 'cancelled') {
            return response()->json(['message' => 'Cancelled invoices cannot be reopened'], 400);
        }

        $invoice->update([
            'status' => 'pending',
            'paid_at' => null,
        ]);

        return response()->json([
            'message' => 'Invoice marked as pending',
            'data' => $invoice->fresh()
        ]);
    }

    /**
     * Data for a printable receipt. Returns structured JSON rather than
     * a rendered PDF — no PDF library (e.g. barryvdh/laravel-dompdf) is
     * confirmed installed in this project, and generating one client-side
     * via the browser's print dialog (window.print() on a receipt view)
     * needs no new dependency. If you want a server-generated PDF instead,
     * install a PDF package and this endpoint can be adapted to stream one.
     */
    public function receipt(Invoice $invoice)
    {
        $invoice->load(['patient.user', 'doctor.user', 'booking']);

        return response()->json([
            'invoice_number' => $invoice->invoice_number,
            'date' => $invoice->created_at->format('M j, Y'),
            'patient_name' => $invoice->patient->user->name ?? 'N/A',
            'doctor_name' => $invoice->doctor->full_name ?? ($invoice->doctor->user->name ?? null),
            'service_name' => $invoice->service_name,
            'amount' => $invoice->formatted_amount,
            'status' => $invoice->status,
            'paid_at' => $invoice->paid_at?->format('M j, Y g:i A'),
            'payment_method' => $invoice->payment_method,
        ]);
    }
}
