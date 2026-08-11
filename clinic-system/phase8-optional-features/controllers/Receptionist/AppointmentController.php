<?php

namespace App\Http\Controllers\Api\Receptionist;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AppointmentController extends Controller
{
    /**
     * Create an appointment on behalf of a patient. Unlike the patient
     * self-service booking endpoint (AppointmentController::store),
     * the receptionist specifies which patient this is for, and is not
     * restricted to booking for themselves.
     *
     * A patient must be approved before an appointment can be booked for
     * them — same rule as patient self-service booking.
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
            // Receptionist-created bookings are confirmed immediately —
            // they've already coordinated the slot with the desk/patient,
            // unlike patient self-service bookings which start pending
            // for the doctor to accept.
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

    public function cancel(Booking $booking)
    {
        if ($booking->status === 'cancelled') {
            return response()->json(['message' => 'Booking already cancelled'], 400);
        }

        if ($booking->status === 'completed') {
            return response()->json(['message' => 'Completed bookings cannot be cancelled'], 400);
        }

        $booking->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Appointment cancelled successfully',
            'data' => $booking
        ]);
    }

    /**
     * Check a patient in for their appointment. As of Phase 8 (Queue
     * Management), this also puts them in the waiting queue —
     * checked_in_at still means "arrived at the desk", queue_status
     * tracks where they are after that.
     */
    public function checkIn(Booking $booking)
    {
        if ($booking->status !== 'confirmed') {
            return response()->json([
                'message' => 'Only confirmed appointments can be checked in'
            ], 400);
        }

        if ($booking->checked_in_at) {
            return response()->json(['message' => 'Patient is already checked in'], 400);
        }

        $booking->update(['checked_in_at' => now(), 'queue_status' => 'waiting']);

        return response()->json([
            'message' => 'Patient checked in successfully',
            'data' => $booking->fresh()
        ]);
    }

    /**
     * Send a checked-in patient to a room — moves them from "waiting" to
     * "in_consult" in the doctor's queue view. A doctor can also do this
     * themselves from their own queue (see Doctor\QueueController::call),
     * this is the receptionist-initiated equivalent from the desk.
     */
    public function sendToRoom(Request $request, Booking $booking)
    {
        if ($booking->queue_status !== 'waiting') {
            return response()->json([
                'message' => 'Only patients currently waiting can be sent to a room'
            ], 400);
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
            'message' => 'Patient sent to room',
            'data' => $booking->fresh()
        ]);
    }

    /**
     * Today's schedule across all doctors — the receptionist desk view.
     */
    public function todaySchedule(Request $request)
    {
        $query = Booking::whereDate('date', now()->toDateString())
            ->whereIn('status', ['pending', 'confirmed'])
            ->with(['patient.user', 'service.doctor.user'])
            ->orderBy('time', 'asc');

        if ($request->filled('doctor_id')) {
            $query->whereHas('service', function ($q) use ($request) {
                $q->where('doctor_id', $request->doctor_id);
            });
        }

        return response()->json($query->get());
    }

    /**
     * Doctor availability (status) list — for the "Doctor Availability"
     * dashboard widget and appointment-creation form.
     */
    public function doctorAvailability()
    {
        $doctors = Doctor::with(['user', 'specialization'])->get();

        return response()->json($doctors->map(function ($doctor) {
            return [
                'id' => $doctor->id,
                'name' => $doctor->full_name ?: ($doctor->user->name ?? 'N/A'),
                'specialization' => $doctor->specialization->name ?? 'General',
                'available' => (bool) $doctor->status,
            ];
        }));
    }

    /**
     * A doctor's active services — used to populate the service picker
     * in the receptionist's appointment-booking form. There's no
     * receptionist-scoped equivalent of PatientController::getDoctorServices
     * (that one sits behind role:patient), so this fills the gap rather
     * than having the frontend call a route its token can't access.
     */
    public function doctorServices(Doctor $doctor)
    {
        $services = Service::where('doctor_id', $doctor->id)
            ->where('is_active', true)
            ->get();

        return response()->json($services);
    }

    /**
     * A specific doctor's schedule for a given date (defaults to today).
     */
    public function doctorSchedule(Request $request, Doctor $doctor)
    {
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
    }
}
