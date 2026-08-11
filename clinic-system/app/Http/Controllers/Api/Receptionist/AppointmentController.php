<?php
// app/Http/Controllers/Api/Receptionist/AppointmentController.php

namespace App\Http\Controllers\Api\Receptionist;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class AppointmentController extends Controller
{
    /**
     * Create an appointment on behalf of a patient.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'service_id' => 'required|exists:services,id',
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required|date_format:H:i',
            'notes' => 'nullable|string|max:500',
        ]);

        $patient = Patient::find($validated['patient_id']);

        if ($patient->approval_status !== 'approved') {
            return response()->json([
                'message' => 'This patient\'s registration is not yet approved. Approve them before booking.'
            ], 403);
        }

        $service = Service::find($validated['service_id']);

        $exists = Booking::where('service_id', $validated['service_id'])
            ->where('date', $validated['date'])
            ->where('time', $validated['time'])
            ->whereIn('status', ['pending', 'confirmed'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'This time slot is already booked'], 409);
        }

        $booking = Booking::create([
            'patient_id' => $patient->id,
            'service_id' => $service->id,
            'doctor_id' => $service->doctor_id,
            'date' => $validated['date'],
            'time' => $validated['time'],
            'notes' => $validated['notes'] ?? null,
            'status' => 'confirmed',
        ]);

        return response()->json([
            'message' => 'Appointment created successfully',
            'data' => $booking->load(['patient.user', 'service.doctor.user'])
        ], 201);
    }

    /**
     * Reschedule an existing appointment.
     */
    public function reschedule(Request $request, Booking $booking)
    {
        if ($booking->status === 'cancelled' || $booking->status === 'completed') {
            return response()->json([
                'message' => ucfirst($booking->status) . ' bookings cannot be rescheduled'
            ], 400);
        }

        $validated = $request->validate([
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required|date_format:H:i',
            'notes' => 'nullable|string|max:500',
        ]);

        $exists = Booking::where('service_id', $booking->service_id)
            ->where('date', $validated['date'])
            ->where('time', $validated['time'])
            ->where('id', '!=', $booking->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'This time slot is already booked'], 409);
        }

        $booking->update([
            'date' => $validated['date'],
            'time' => $validated['time'],
            'notes' => $validated['notes'] ?? $booking->notes,
        ]);

        return response()->json([
            'message' => 'Appointment rescheduled successfully',
            'data' => $booking->fresh()->load(['patient.user', 'service.doctor.user'])
        ]);
    }

    /**
     * Cancel an appointment
     */
    public function cancel(Booking $booking)
    {
        if ($booking->status === 'cancelled') {
            return response()->json(['message' => 'Booking already cancelled'], 400);
        }

        if ($booking->status === 'completed') {
            return response()->json(['message' => 'Completed bookings cannot be cancelled'], 400);
        }

        $booking->update([
            'status' => 'cancelled',
            'queue_status' => null,
            'room' => null,
            'called_at' => null,
        ]);

        return response()->json([
            'message' => 'Appointment cancelled successfully',
            'data' => $booking
        ]);
    }

    /**
     * Check a patient in for their appointment.
     */
    public function checkIn(Request $request, Booking $booking)
    {
        try {
            if ($booking->status !== 'confirmed') {
                return response()->json([
                    'message' => 'Only confirmed appointments can be checked in. Current status: ' . $booking->status
                ], 400);
            }

            if ($booking->checked_in_at) {
                return response()->json([
                    'message' => 'Patient is already checked in'
                ], 400);
            }

            $booking->update([
                'checked_in_at' => now(),
                'queue_status' => 'waiting'
            ]);

            return response()->json([
                'message' => 'Patient checked in successfully and added to queue',
                'data' => $booking->fresh()->load(['patient.user', 'service.doctor.user'])
            ]);

        } catch (\Exception $e) {
            Log::error('Check-in error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error checking in patient',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Phase 8: Send a checked-in patient to a room.
     */
    public function sendToRoom(Request $request, Booking $booking)
    {
        try {
            if ($booking->queue_status !== 'waiting') {
                return response()->json([
                    'message' => 'Only patients currently waiting can be sent to a room. Current status: ' . $booking->queue_status
                ], 400);
            }

            $validated = $request->validate([
                'room' => 'nullable|string|max:50',
            ]);

            $booking->update([
                'queue_status' => 'in_consult',
                'room' => $validated['room'] ?? $booking->room ?? 'Room ' . rand(1, 10),
                'called_at' => now(),
            ]);

            return response()->json([
                'message' => 'Patient sent to room successfully',
                'data' => $booking->fresh()->load(['patient.user', 'service.doctor.user'])
            ]);

        } catch (\Exception $e) {
            Log::error('Send to room error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error sending patient to room',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Today's schedule across all doctors.
     */
    public function todaySchedule(Request $request)
    {
        try {
            $query = Booking::whereDate('date', now()->toDateString())
                ->whereIn('status', ['pending', 'confirmed'])
                ->with(['patient.user', 'service.doctor.user'])
                ->orderBy('time', 'asc');

            if ($request->filled('doctor_id')) {
                $query->whereHas('service', function ($q) use ($request) {
                    $q->where('doctor_id', $request->doctor_id);
                });
            }

            $bookings = $query->get();

            return response()->json($bookings);

        } catch (\Exception $e) {
            Log::error('Today schedule error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching today\'s schedule',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Doctor availability (status) list.
     */
    public function doctorAvailability()
    {
        try {
            $doctors = Doctor::with(['user', 'specialization'])->get();

            return response()->json($doctors->map(function ($doctor) {
                // Check if doctor has any bookings today
                $todayBookings = Booking::where('doctor_id', $doctor->id)
                    ->whereDate('date', now()->toDateString())
                    ->whereIn('status', ['confirmed', 'checked_in', 'in_progress'])
                    ->count();
                
                $isAvailable = (bool) $doctor->status && $todayBookings < 8;
                
                return [
                    'id' => $doctor->id,
                    'name' => $doctor->full_name ?: ($doctor->user->name ?? 'N/A'),
                    'specialization' => $doctor->specialization->name ?? 'General',
                    'available' => (bool) $doctor->status,
                    'is_available' => $isAvailable,
                    'today_bookings' => $todayBookings,
                    'max_bookings' => 8,
                    'status' => $doctor->status,
                ];
            }));

        } catch (\Exception $e) {
            Log::error('Doctor availability error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching doctor availability',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * A doctor's active services.
     */
    public function doctorServices(Doctor $doctor)
    {
        try {
            $services = Service::where('doctor_id', $doctor->id)
                ->where('is_active', true)
                ->get()
                ->map(function ($service) {
                    return [
                        'id' => $service->id,
                        'name' => $service->name,
                        'description' => $service->description,
                        'price' => $service->price,
                        'duration' => $service->duration,
                    ];
                });

            return response()->json($services);

        } catch (\Exception $e) {
            Log::error('Doctor services error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching doctor services',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * List services for a specific doctor by ID.
     */
    public function listServicesForDoctor($doctorId)
    {
        try {
            $doctor = Doctor::find($doctorId);
            if (!$doctor) {
                return response()->json([
                    'message' => 'Doctor not found'
                ], 404);
            }
            return $this->doctorServices($doctor);
        } catch (\Exception $e) {
            Log::error('List services error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching services',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * A specific doctor's schedule for a given date.
     */
    public function doctorSchedule(Request $request, Doctor $doctor)
    {
        try {
            $date = $request->input('date', now()->toDateString());

            $bookings = Booking::whereDate('date', $date)
                ->whereHas('service', function ($q) use ($doctor) {
                    $q->where('doctor_id', $doctor->id);
                })
                ->whereIn('status', ['pending', 'confirmed', 'completed'])
                ->with(['patient.user', 'service'])
                ->orderBy('time', 'asc')
                ->get();

            return response()->json($bookings);

        } catch (\Exception $e) {
            Log::error('Doctor schedule error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching doctor schedule',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}