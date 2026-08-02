<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Patient;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class AppointmentController extends Controller
{
    /**
     * Get upcoming appointments for the authenticated patient
     */
    public function upcoming(Request $request)
    {
        try {
            $patient = Patient::where('user_id', Auth::id())->first();
            
            if (!$patient) {
                return response()->json([]);
            }

            $bookings = Booking::where('patient_id', $patient->id)
                ->whereIn('status', ['pending', 'confirmed'])
                ->where('date', '>=', now()->format('Y-m-d'))
                ->with(['service', 'service.doctor.user'])
                ->orderBy('date', 'asc')
                ->orderBy('time', 'asc')
                ->get();

            return response()->json($bookings->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'date' => $booking->date,
                    'time' => $booking->time,
                    'status' => $booking->status,
                    'service' => $booking->service->name ?? 'N/A',
                    'doctor' => [
                        'name' => $booking->service->doctor->full_name ?? $booking->service->doctor->user->name ?? 'N/A',
                        'id' => $booking->service->doctor_id,
                    ],
                    'notes' => $booking->notes,
                ];
            }));

        } catch (\Exception $e) {
            \Log::error('Upcoming appointments error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching upcoming appointments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get past appointments for the authenticated patient
     */
    public function past(Request $request)
    {
        try {
            $patient = Patient::where('user_id', Auth::id())->first();
            
            if (!$patient) {
                return response()->json([]);
            }

            $bookings = Booking::where('patient_id', $patient->id)
                ->whereIn('status', ['completed', 'cancelled'])
                ->with(['service', 'service.doctor.user'])
                ->orderBy('date', 'desc')
                ->orderBy('time', 'desc')
                ->limit(20)
                ->get();

            return response()->json($bookings->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'date' => $booking->date,
                    'time' => $booking->time,
                    'status' => $booking->status,
                    'service' => $booking->service->name ?? 'N/A',
                    'doctor' => [
                        'name' => $booking->service->doctor->full_name ?? $booking->service->doctor->user->name ?? 'N/A',
                        'id' => $booking->service->doctor_id,
                    ],
                    'notes' => $booking->notes,
                ];
            }));

        } catch (\Exception $e) {
            \Log::error('Past appointments error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching past appointments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get patient's my bookings
     */
    public function myBookings(Request $request)
    {
        try {
            $patient = Patient::where('user_id', Auth::id())->first();
            
            if (!$patient) {
                return response()->json([]);
            }

            $bookings = Booking::where('patient_id', $patient->id)
                ->with(['service', 'service.doctor.user'])
                ->orderBy('date', 'desc')
                ->orderBy('time', 'desc')
                ->get();

            return response()->json($bookings);

        } catch (\Exception $e) {
            \Log::error('My bookings error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching bookings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new appointment booking
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'service_id' => 'required|exists:services,id',
                'date' => 'required|date|after_or_equal:today',
                'time' => 'required|date_format:H:i',
                'notes' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $patient = Patient::where('user_id', Auth::id())->first();

            if (!$patient) {
                return response()->json(['message' => 'Patient profile not found'], 404);
            }

            $service = Service::find($request->service_id);

            // Check if the service exists and is active
            if (!$service) {
                return response()->json(['message' => 'Service not found'], 404);
            }

            if (!$service->is_active) {
                return response()->json([
                    'message' => 'This service is currently not available'
                ], 400);
            }

            // Check if slot is available
            $exists = Booking::where('service_id', $request->service_id)
                ->where('date', $request->date)
                ->where('time', $request->time)
                ->whereIn('status', ['pending', 'confirmed'])
                ->exists();

            if ($exists) {
                return response()->json([
                    'message' => 'This time slot is already booked'
                ], 409);
            }

            $booking = Booking::create([
                'patient_id' => $patient->id,
                'service_id' => $request->service_id,
                'date' => $request->date,
                'time' => $request->time,
                'notes' => $request->notes,
                'status' => 'pending',
            ]);

            return response()->json([
                'message' => 'Booking created successfully',
                'data' => $booking->load(['service', 'service.doctor.user'])
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Booking creation error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error creating booking',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel a booking (patient cancels)
     */
    public function cancel(Request $request, Booking $booking)
    {
        try {
            $patient = Patient::where('user_id', Auth::id())->first();

            if (!$patient) {
                return response()->json(['message' => 'Patient not found'], 404);
            }

            if ($booking->patient_id !== $patient->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            if ($booking->status === 'cancelled') {
                return response()->json(['message' => 'Booking already cancelled'], 400);
            }

            if ($booking->status === 'completed') {
                return response()->json(['message' => 'Completed bookings cannot be cancelled'], 400);
            }

            $booking->update(['status' => 'cancelled']);

            return response()->json([
                'message' => 'Booking cancelled successfully',
                'data' => $booking
            ]);

        } catch (\Exception $e) {
            \Log::error('Cancel booking error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error cancelling booking',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a booking (patient updates)
     */
    public function update(Request $request, Booking $booking)
    {
        try {
            $patient = Patient::where('user_id', Auth::id())->first();

            if (!$patient) {
                return response()->json(['message' => 'Patient not found'], 404);
            }

            if ($booking->patient_id !== $patient->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            if ($booking->status === 'cancelled') {
                return response()->json(['message' => 'Cancelled bookings cannot be updated'], 400);
            }

            if ($booking->status === 'completed') {
                return response()->json(['message' => 'Completed bookings cannot be updated'], 400);
            }

            $validator = Validator::make($request->all(), [
                'date' => 'required|date|after_or_equal:today',
                'time' => 'required|date_format:H:i',
                'notes' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            // Check if slot is available
            $exists = Booking::where('service_id', $booking->service_id)
                ->where('date', $request->date)
                ->where('time', $request->time)
                ->where('id', '!=', $booking->id)
                ->whereIn('status', ['pending', 'confirmed'])
                ->exists();

            if ($exists) {
                return response()->json([
                    'message' => 'This time slot is already booked'
                ], 409);
            }

            $booking->update([
                'date' => $request->date,
                'time' => $request->time,
                'notes' => $request->notes,
            ]);

            return response()->json([
                'message' => 'Booking updated successfully',
                'data' => $booking->load(['service', 'service.doctor.user'])
            ]);

        } catch (\Exception $e) {
            \Log::error('Update booking error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error updating booking',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get doctor's bookings
     */
    public function doctorBookings(Request $request)
    {
        try {
            $doctor = $request->user()->doctor;
            
            if (!$doctor) {
                return response()->json([
                    'message' => 'Doctor profile not found'
                ], 404);
            }

            // Get all bookings for this doctor's services
            $bookings = Booking::whereHas('service', function ($query) use ($doctor) {
                $query->where('doctor_id', $doctor->id);
            })
            ->with(['patient', 'service'])
            ->orderBy('date', 'desc')
            ->orderBy('time', 'desc')
            ->get();

            return response()->json($bookings);

        } catch (\Exception $e) {
            \Log::error('Doctor bookings error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching doctor bookings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Accept a booking (doctor accepts)
     */
    public function accept(Request $request, Booking $booking)
    {
        try {
            $doctor = $request->user()->doctor;
            
            if (!$doctor) {
                return response()->json(['message' => 'Doctor not found'], 404);
            }

            // Check if this booking belongs to this doctor
            if ($booking->service->doctor_id !== $doctor->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            if ($booking->status !== 'pending') {
                return response()->json(['message' => 'Only pending bookings can be accepted'], 400);
            }

            $booking->update(['status' => 'confirmed']);

            return response()->json([
                'message' => 'Booking accepted successfully',
                'data' => $booking->load(['patient', 'service'])
            ]);

        } catch (\Exception $e) {
            \Log::error('Accept booking error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error accepting booking',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update booking status (doctor updates)
     */
    public function updateStatus(Request $request, Booking $booking)
    {
        try {
            $doctor = $request->user()->doctor;
            
            if (!$doctor) {
                return response()->json(['message' => 'Doctor not found'], 404);
            }

            // Check if this booking belongs to this doctor
            if ($booking->service->doctor_id !== $doctor->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $validator = Validator::make($request->all(), [
                'status' => 'required|in:pending,confirmed,completed,cancelled',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $booking->update(['status' => $request->status]);

            return response()->json([
                'message' => 'Booking status updated successfully',
                'data' => $booking->load(['patient', 'service'])
            ]);

        } catch (\Exception $e) {
            \Log::error('Update status error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error updating booking status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin bookings view
     */
    public function adminAppointments(Request $request)
    {
        try {
            $bookings = Booking::with(['patient', 'service.doctor.user'])
                ->orderBy('date', 'desc')
                ->orderBy('time', 'desc')
                ->get();

            return response()->json($bookings);

        } catch (\Exception $e) {
            \Log::error('Admin bookings error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching bookings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show a single booking
     */
    public function show(Booking $booking)
    {
        try {
            $booking->load(['patient', 'service.doctor.user']);
            return response()->json($booking);

        } catch (\Exception $e) {
            \Log::error('Show booking error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching booking',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}