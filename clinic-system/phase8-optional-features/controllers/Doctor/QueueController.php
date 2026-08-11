<?php

namespace App\Http\Controllers\Api\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

/**
 * Queue Management (Phase 8). Matches the roadmap's example:
 *
 *   Waiting Queue
 *   1 Ahmed
 *   2 Sarah
 *   3 Mohamed
 *
 * Position is just arrival order (checked_in_at ascending) among today's
 * bookings for this doctor currently in the 'waiting' queue_status.
 */
class QueueController extends Controller
{
    /**
     * The doctor's waiting queue for today, in arrival order.
     */
    public function index(Request $request)
    {
        $doctor = $request->user()->doctor;

        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 404);
        }

        $waiting = Booking::whereDate('date', now()->toDateString())
            ->whereHas('service', fn ($q) => $q->where('doctor_id', $doctor->id))
            ->where('queue_status', 'waiting')
            ->with(['patient.user', 'service'])
            ->orderBy('checked_in_at', 'asc')
            ->get()
            ->values()
            ->map(function ($booking, $index) {
                return [
                    'position' => $index + 1,
                    'booking_id' => $booking->id,
                    'patient_name' => $booking->patient->user->name ?? 'N/A',
                    'service_name' => $booking->service->name ?? null,
                    'checked_in_at' => $booking->checked_in_at,
                    'time' => $booking->time,
                ];
            });

        $inConsult = Booking::whereDate('date', now()->toDateString())
            ->whereHas('service', fn ($q) => $q->where('doctor_id', $doctor->id))
            ->where('queue_status', 'in_consult')
            ->with(['patient.user'])
            ->get()
            ->map(function ($booking) {
                return [
                    'booking_id' => $booking->id,
                    'patient_name' => $booking->patient->user->name ?? 'N/A',
                    'room' => $booking->room,
                    'called_at' => $booking->called_at,
                ];
            });

        return response()->json([
            'waiting' => $waiting,
            'in_consult' => $inConsult,
        ]);
    }

    /**
     * Call the next patient (or a specific one) into consult.
     */
    public function call(Request $request, Booking $booking)
    {
        $doctor = $request->user()->doctor;

        if (!$doctor || $booking->service->doctor_id !== $doctor->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($booking->queue_status !== 'waiting') {
            return response()->json(['message' => 'Patient is not currently waiting'], 400);
        }

        $validated = $request->validate([
            'room' => 'nullable|string|max:50',
        ]);

        $booking->update([
            'queue_status' => 'in_consult',
            'room' => $validated['room'] ?? $booking->room,
            'called_at' => now(),
        ]);

        return response()->json([
            'message' => 'Patient called in',
            'data' => $booking->fresh()
        ]);
    }

    /**
     * Finish the consultation — marks the booking completed and clears
     * them from the queue.
     */
    public function complete(Request $request, Booking $booking)
    {
        $doctor = $request->user()->doctor;

        if (!$doctor || $booking->service->doctor_id !== $doctor->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $booking->update([
            'status' => 'completed',
            'queue_status' => 'done',
        ]);

        return response()->json([
            'message' => 'Consultation completed',
            'data' => $booking->fresh()
        ]);
    }
}
