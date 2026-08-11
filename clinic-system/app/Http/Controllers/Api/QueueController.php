<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class QueueController extends Controller
{
    public function index(Request $request)
    {
        try {
            $doctor = $request->user()->doctor;

            if (!$doctor) {
                return response()->json(['message' => 'Doctor profile not found'], 404);
            }

            // Get all confirmed bookings for this doctor
            $bookings = Booking::whereHas('service', function ($q) use ($doctor) {
                $q->where('doctor_id', $doctor->id);
            })
            ->with(['patient.user', 'service'])
            ->orderBy('date', 'desc')
            ->get();

            // Separate waiting and in-consult
            $waiting = [];
            $inConsult = [];

            foreach ($bookings as $booking) {
                // Check if the booking has queue_status
                if (isset($booking->queue_status)) {
                    if ($booking->queue_status === 'waiting') {
                        $waiting[] = [
                            'id' => $booking->id,
                            'patient_name' => $booking->patient->user->name ?? 'N/A',
                            'service_name' => $booking->service->name ?? null,
                            'checked_in_at' => $booking->checked_in_at ?? $booking->created_at,
                            'time' => $booking->time ?? $booking->appointment_time,
                            'date' => $booking->date ?? $booking->appointment_date,
                        ];
                    } elseif ($booking->queue_status === 'in_consult') {
                        $inConsult[] = [
                            'id' => $booking->id,
                            'patient_name' => $booking->patient->user->name ?? 'N/A',
                            'room' => $booking->room ?? 'Room 1',
                            'called_at' => $booking->called_at ?? now(),
                        ];
                    }
                }
            }

            return response()->json([
                'waiting' => $waiting,
                'in_consult' => $inConsult,
                'waiting_count' => count($waiting),
                'in_consult_count' => count($inConsult),
            ]);

        } catch (\Exception $e) {
            Log::error('QueueController error: ' . $e->getMessage());
            return response()->json([
                'waiting' => [],
                'in_consult' => [],
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function call(Request $request, Booking $booking)
    {
        try {
            $doctor = $request->user()->doctor;

            if (!$doctor || $booking->service->doctor_id !== $doctor->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $validated = $request->validate([
                'room' => 'nullable|string|max:50',
            ]);

            $booking->update([
                'queue_status' => 'in_consult',
                'room' => $validated['room'] ?? $booking->room ?? 'Room 1',
                'called_at' => now(),
            ]);

            return response()->json([
                'message' => 'Patient called in',
                'data' => $booking->fresh()
            ]);

        } catch (\Exception $e) {
            Log::error('QueueController call error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error calling patient',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function complete(Request $request, Booking $booking)
    {
        try {
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

        } catch (\Exception $e) {
            Log::error('QueueController complete error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error completing consultation',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}