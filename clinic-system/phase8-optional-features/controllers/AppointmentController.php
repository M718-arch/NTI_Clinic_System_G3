<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Patient;
use App\Models\Service;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class AppointmentController extends Controller
{
    /**
     * Resolve a doctor's display name safely.
     *
     * IMPORTANT: don't use `??` to fall back from `full_name` to
     * `user->name`, because `??` only triggers on `null` — a doctor row
     * whose `full_name` column is an empty string ("") is NOT null, so
     * `??` was never falling through to the user's account name. That's
     * what caused "Dr. " / "Dr. N/A" to show up for doctors who have an
     * empty `full_name` but a real name on their linked user account.
     */
    private function resolveDoctorName($doctor)
    {
        if (!$doctor) {
            return null;
        }

        $fullName = trim((string) ($doctor->full_name ?? ''));
        if ($fullName !== '') {
            return $fullName;
        }

        $userName = trim((string) ($doctor->user->name ?? ''));
        if ($userName !== '') {
            return $userName;
        }

        return null;
    }

    /**
     * Overwrite `service.doctor.name` on a booking (or collection of
     * bookings) with the resolved name, so every endpoint that serializes
     * a booking agrees on the doctor's display name — whether it comes
     * from `full_name` or falls back to the linked user's `name`.
     *
     * This mutates an *appended/attribute* value on the already-loaded
     * relation, it does not touch the database.
     */
    private function withResolvedDoctorName($bookings)
    {
        $isCollection = $bookings instanceof \Illuminate\Support\Collection
            || $bookings instanceof \Illuminate\Database\Eloquent\Collection;

        $items = $isCollection ? $bookings : collect([$bookings]);

        $items->each(function ($booking) {
            $doctor = $booking->service->doctor ?? null;
            if ($doctor) {
                // Dynamically set/override the `name` attribute on the
                // already-loaded doctor model so it serializes correctly,
                // without persisting anything to the database.
                $doctor->name = $this->resolveDoctorName($doctor) ?? 'N/A';
            }
        });

        return $bookings;
    }

    /**
     * Format a booking's date+time into a friendly string for
     * notification messages, e.g. "Aug 6, 2026 at 9:00 AM".
     */
    private function formatBookingDateTime($date, $time)
    {
        try {
            $dt = \Carbon\Carbon::parse($date . ' ' . $time);
            return $dt->format('M j, Y \a\t g:i A');
        } catch (\Exception $e) {
            return trim($date . ' ' . $time);
        }
    }

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
                        'name' => $this->resolveDoctorName($booking->service->doctor ?? null) ?? 'N/A',
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
                        'name' => $this->resolveDoctorName($booking->service->doctor ?? null) ?? 'N/A',
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
                return response()->json([
                    'bookings' => [],
                    'stats' => [
                        'total' => 0,
                        'upcoming' => 0,
                        'completed' => 0,
                        'cancelled' => 0
                    ]
                ]);
            }

            $bookings = Booking::where('patient_id', $patient->id)
                ->with(['service', 'service.doctor.user'])
                ->orderBy('date', 'desc')
                ->orderBy('time', 'desc')
                ->get();

            // Make sure `booking.service.doctor.name` is populated the same
            // way as the /upcoming and /past endpoints (full_name, falling
            // back to the linked user's name — see resolveDoctorName()).
            // This endpoint returns raw Eloquent models, unlike the two
            // above which hand-build the response array, so without this
            // the frontend's `booking.service?.doctor?.name` was reading a
            // field that never got set.
            $this->withResolvedDoctorName($bookings);

            $now = now();
            $stats = [
                'total' => $bookings->count(),
                'upcoming' => $bookings->filter(function($b) use ($now) {
                    return $b->status !== 'cancelled' && 
                           $b->status !== 'completed' && 
                           $b->date >= $now->toDateString();
                })->count(),
                'completed' => $bookings->where('status', 'completed')->count(),
                'cancelled' => $bookings->where('status', 'cancelled')->count()
            ];

            return response()->json([
                'bookings' => $bookings,
                'stats' => $stats
            ]);

        } catch (\Exception $e) {
            \Log::error('My bookings error: ' . $e->getMessage());
            return response()->json([
                'bookings' => [],
                'stats' => [
                    'total' => 0,
                    'upcoming' => 0,
                    'completed' => 0,
                    'cancelled' => 0
                ]
            ], 500);
        }
    }

    /**
     * Store a new appointment booking
     */
    public function store(Request $request)
    {
        try {
            \Log::info('Booking attempt - Full request:', $request->all());

            // Accept both field names
            $date = $request->appointment_date ?? $request->date;
            $time = $request->appointment_time ?? $request->time;
            $service_id = $request->service_id;
            $notes = $request->notes;

            \Log::info('Parsed booking data:', [
                'service_id' => $service_id,
                'date' => $date,
                'time' => $time,
                'notes' => $notes
            ]);

            $validator = Validator::make([
                'service_id' => $service_id,
                'date' => $date,
                'time' => $time,
                'notes' => $notes
            ], [
                'service_id' => 'required|exists:services,id',
                'date' => 'required|date|after_or_equal:today',
                'time' => 'required|date_format:H:i',
                'notes' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                \Log::error('Validation failed:', $validator->errors()->toArray());
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $user = Auth::user();
            $patient = Patient::where('user_id', $user->id)->first();

            // Auto-create patient if not exists
            if (!$patient) {
                \Log::info('Patient not found, creating one for user: ' . $user->id);
                
                $patient = Patient::create([
                    'user_id' => $user->id,
                    'first_name' => explode(' ', $user->name)[0] ?? $user->name,
                    'last_name' => explode(' ', $user->name)[1] ?? '',
                    'email' => $user->email,
                    'phone' => $user->phone ?? '',
                    'status' => 'active',
                    // This fallback path only fires for a patient-role user
                    // that has no Patient row yet — an edge case (e.g. a
                    // pre-Phase-5 account), not the normal registration
                    // flow. Normal registrations go through
                    // RegisteredUserController and start 'pending'. Since
                    // this user already reached a booking screen, treat
                    // them as approved rather than silently blocking them.
                    'approval_status' => 'approved',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                \Log::info('Patient created: ' . $patient->id);
            }

            // Phase 5: patients must be approved by a receptionist before
            // they can book. See Patient Registration Workflow in the
            // roadmap.
            if ($patient->approval_status !== 'approved') {
                return response()->json([
                    'message' => $patient->approval_status === 'pending'
                        ? 'Your account is pending approval. You will be able to book once a staff member approves your registration.'
                        : 'Your account registration was not approved. Please contact the clinic.'
                ], 403);
            }

            $service = Service::find($service_id);

            if (!$service) {
                \Log::error('Service not found: ' . $service_id);
                return response()->json(['message' => 'Service not found'], 404);
            }

            // Check if slot is available
            $exists = Booking::where('service_id', $service_id)
                ->where('date', $date)
                ->where('time', $time)
                ->whereIn('status', ['pending', 'confirmed'])
                ->exists();

            if ($exists) {
                return response()->json([
                    'message' => 'This time slot is already booked'
                ], 409);
            }

            $booking = Booking::create([
                'patient_id' => $patient->id,
                'service_id' => $service_id,
                'doctor_id' => $service->doctor_id,
                'date' => $date,
                'time' => $time,
                'notes' => $notes,
                'status' => 'pending',
            ]);

            \Log::info('Booking created:', $booking->toArray());

            // "Appointment Booked" notification.
            Notification::create([
                'patient_id' => $patient->id,
                'booking_id' => $booking->id,
                'type' => 'appointment_booked',
                'message' => "Your {$service->name} appointment on {$this->formatBookingDateTime($date, $time)} has been booked and is awaiting confirmation.",
            ]);

            return response()->json([
                'message' => 'Booking created successfully',
                'data' => $booking
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Booking creation error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'message' => 'Error creating booking',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel a booking. Bound to three routes — patient (my-bookings),
     * doctor (bookings), and admin (appointments) — but until now only
     * had patient-authorization logic, so a doctor or admin hitting
     * their cancel button always got "Patient not found" (404): Auth::id()
     * for a doctor/admin user has no matching Patient row. Fixed to
     * branch by role, the same pattern already used in updateStatus().
     */
    public function cancel(Request $request, Booking $booking)
    {
        try {
            $user = $request->user();

            if ($user->role === 'patient') {
                $patient = Patient::where('user_id', $user->id)->first();

                if (!$patient) {
                    return response()->json(['message' => 'Patient not found'], 404);
                }

                if ($booking->patient_id !== $patient->id) {
                    return response()->json(['message' => 'Unauthorized'], 403);
                }
            } elseif ($user->role === 'doctor') {
                $doctor = $user->doctor;

                if (!$doctor) {
                    return response()->json(['message' => 'Doctor not found'], 404);
                }

                if ($booking->service->doctor_id !== $doctor->id) {
                    return response()->json(['message' => 'Unauthorized'], 403);
                }
            } elseif ($user->role !== 'admin') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            // admin: no extra ownership check, can cancel any booking.

            if ($booking->status === 'cancelled') {
                return response()->json(['message' => 'Booking already cancelled'], 400);
            }

            if ($booking->status === 'completed') {
                return response()->json(['message' => 'Completed bookings cannot be cancelled'], 400);
            }

            $booking->update(['status' => 'cancelled', 'queue_status' => null]);

            // "Appointment Cancelled" notification.
            if ($booking->patient_id) {
                $serviceName = $booking->service->name ?? 'your appointment';
                Notification::create([
                    'patient_id' => $booking->patient_id,
                    'booking_id' => $booking->id,
                    'type' => 'appointment_cancelled',
                    'message' => "Your {$serviceName} appointment on {$this->formatBookingDateTime($booking->date, $booking->time)} was cancelled.",
                ]);
            }

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

        // Accept both field names (date/appointment_date and time/appointment_time)
        $date = $request->date ?? $request->appointment_date;
        $time = $request->time ?? $request->appointment_time;

        $validator = Validator::make([
            'date' => $date,
            'time' => $time,
            'notes' => $request->notes
        ], [
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required|date_format:H:i',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check if slot is available
        $exists = Booking::where('service_id', $booking->service_id)
            ->where('date', $date)
            ->where('time', $time)
            ->where('id', '!=', $booking->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'This time slot is already booked'
            ], 409);
        }

        $booking->update([
            'date' => $date,
            'time' => $time,
            'notes' => $request->notes ?? $booking->notes,
        ]);

        return response()->json([
            'message' => 'Booking updated successfully',
            'data' => $booking->load(['service', 'service.doctor.user'])
        ]);

    } catch (\Exception $e) {
        \Log::error('Update booking error: ' . $e->getMessage());
        \Log::error('Stack trace: ' . $e->getTraceAsString());
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

            $bookings = Booking::whereHas('service', function ($query) use ($doctor) {
                $query->where('doctor_id', $doctor->id);
            })
            ->with(['patient.user', 'service'])
            ->orderBy('date', 'desc')
            ->orderBy('time', 'desc')
            ->get();

            // Patient has no `name` column of its own — it lives on the linked
            // User. Set it as a dynamic attribute so it serializes into the
            // JSON response the same way `booking.patient?.name` expects it.
            $bookings->each(function ($booking) {
                if ($booking->patient) {
                    $resolvedName = trim((string) ($booking->patient->user->name ?? ''));
                    $booking->patient->name = $resolvedName !== '' ? $resolvedName : 'Unknown Patient';
                }
            });

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

            if ($booking->service->doctor_id !== $doctor->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            if ($booking->status !== 'pending') {
                return response()->json(['message' => 'Only pending bookings can be accepted'], 400);
            }

            $booking->update(['status' => 'confirmed']);

            // "Appointment Approved" notification.
            Notification::create([
                'patient_id' => $booking->patient_id,
                'booking_id' => $booking->id,
                'type' => 'appointment_approved',
                'message' => "Your {$booking->service->name} appointment on {$this->formatBookingDateTime($booking->date, $booking->time)} has been confirmed.",
            ]);

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
     * Update a booking's status directly.
     *
     * Wired up to two routes that both point at this same action:
     *   - PATCH /api/doctor/bookings/{booking}/status   (role:doctor)
     *   - PATCH /api/admin/appointments/{booking}/status (role:admin)
     *
     * Both routes were previously calling a method that didn't exist on
     * this controller, so hitting either one threw a "method does not
     * exist" error. This adds the method and authorizes based on the
     * requesting user's role, since the same action is shared by two
     * different route groups with different ownership rules:
     *   - A doctor may only update bookings for their own services.
     *   - An admin may update any booking.
     */
    public function updateStatus(Request $request, Booking $booking)
    {
        try {
            $validator = Validator::make($request->all(), [
                'status' => 'required|in:pending,confirmed,completed,cancelled',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $user = $request->user();

            if ($user->role === 'doctor') {
                $doctor = $user->doctor;

                if (!$doctor) {
                    return response()->json(['message' => 'Doctor profile not found'], 404);
                }

                if ($booking->service->doctor_id !== $doctor->id) {
                    return response()->json(['message' => 'Unauthorized'], 403);
                }
            } elseif ($user->role !== 'admin') {
                // Any other role (patient, receptionist, etc.) is not
                // permitted to force a status change directly — patients
                // go through cancel(), doctors through accept()/cancel()
                // for the common cases and this endpoint for the rest.
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $booking->update(['status' => $request->status]);

            return response()->json([
                'message' => 'Booking status updated successfully',
                'data' => $booking->load(['patient', 'service.doctor.user'])
            ]);

        } catch (\Exception $e) {
            \Log::error('Update booking status error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'message' => 'Error updating booking status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a booking (doctor updates) — including drag/drop reschedules
     * from the doctor's calendar.
     */
    public function updateByDoctor(Request $request, Booking $booking)
    {
        try {
            $doctor = $request->user()->doctor;

            if (!$doctor) {
                return response()->json(['message' => 'Doctor not found'], 404);
            }

            if ($booking->service->doctor_id !== $doctor->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // Accept both field names
            $date = $request->date ?? $request->appointment_date;
            $time = $request->time ?? $request->appointment_time;

            $validator = Validator::make([
                'date' => $date,
                'time' => $time,
                'notes' => $request->notes
            ], [
                'date' => 'required|date',
                'time' => 'required|date_format:H:i',
                'notes' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            // Check if slot is available
            $exists = Booking::where('service_id', $booking->service_id)
                ->where('date', $date)
                ->where('time', $time)
                ->where('id', '!=', $booking->id)
                ->whereIn('status', ['pending', 'confirmed'])
                ->exists();

            if ($exists) {
                return response()->json([
                    'message' => 'This time slot is already booked'
                ], 409);
            }

            // Capture the old date/time before overwriting, so we can tell
            // whether this was an actual reschedule (vs. e.g. only notes
            // changing) and word the notification accordingly.
            $oldDate = $booking->date;
            $oldTime = $booking->time;
            $dateChanged = $oldDate !== $date || $oldTime !== $time;

            $booking->update([
                'date' => $date,
                'time' => $time,
                'notes' => $request->notes ?? $booking->notes,
            ]);

            // Notify the patient when the doctor actually moved the
            // appointment to a different date/time.
            if ($dateChanged && $booking->patient_id) {
                $serviceName = $booking->service->name ?? 'your appointment';
                $newWhen = $this->formatBookingDateTime($date, $time);

                Notification::create([
                    'patient_id' => $booking->patient_id,
                    'booking_id' => $booking->id,
                    'type' => 'appointment_rescheduled',
                    'message' => "Your {$serviceName} appointment was rescheduled to {$newWhen}.",
                ]);
            }

            return response()->json([
                'message' => 'Booking updated successfully',
                'data' => $booking->load(['patient', 'service'])
            ]);

        } catch (\Exception $e) {
            \Log::error('Update booking by doctor error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'message' => 'Error updating booking',
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

            $this->withResolvedDoctorName($bookings);

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
            $this->withResolvedDoctorName($booking);
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
