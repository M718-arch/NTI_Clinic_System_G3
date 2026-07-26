<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AppointmentController extends Controller
{
    public function index()
    {
        $services = Service::with('doctor', 'bookings')->get();
        return view('patient.services', compact('services'));
    }

    public function create(Service $service)
    {
        return view('patient.book', compact('service'));
    }

    public function store(Request $request, Service $service)
    {
        $validated = $request->validate([
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required|date_format:H:i',
            'notes' => 'nullable|string|max:500',
        ]);

        $exists = Booking::where('service_id', $service->id)
            ->where('date', $validated['date'])
            ->where('time', $validated['time'])
            ->where('status', '!=', 'cancelled')
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'time' => 'This appointment is already booked. Please choose another time.'
            ])->withInput();
        }

        Booking::create([
            'patient_id' => Auth::id(),
            'service_id' => $service->id,
            'date' => $validated['date'],
            'time' => $validated['time'],
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending',
        ]);

        return redirect()->route('patient.my.bookings')
            ->with('success', 'Appointment booked successfully.');
    }

    public function myBookings()
    {
        $bookings = Booking::with(['service', 'service.doctor'])
            ->where('patient_id', Auth::id())
            ->orderBy('date', 'asc')
            ->orderBy('time', 'asc')
            ->get();

        return view('patient.bookings.my-bookings', compact('bookings'));
    }

    public function doctorServices()
    {
        $services = Service::with(['bookings' => function ($query) {
            $query->where('status', '!=', 'cancelled');
        }])
            ->where('doctor_id', Auth::id())
            ->get();

        return view('doctor.services', compact('services'));
    }

    public function adminAppointments(Request $request)
    {
        $query = Booking::with(['patient', 'service', 'service.doctor']);

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->whereHas('patient', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })->orWhereHas('service', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhereHas('doctor', function ($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%");
                      });
                });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date')) {
            $query->whereDate('date', $request->date);
        }

        $bookings = $query
            ->orderBy('date', 'desc')
            ->orderBy('time', 'desc')
            ->paginate(10)
            ->withQueryString();

        return view('admin.appointments.index', compact('bookings'));
    }

    public function cancel(Booking $booking)
    {
        if (
            Auth::id() != $booking->patient_id &&
            Auth::id() != $booking->service->doctor_id &&
            Auth::user()->role != 'admin'
        ) {
            abort(403, 'You are not authorized to cancel this appointment.');
        }

        $booking->update([
            'status' => 'cancelled',
        ]);

        return back()->with('success', 'Appointment cancelled successfully.');
    }

    public function accept(Booking $booking)
    {
        $booking->update([
            'status' => 'accepted',
        ]);

        return back()->with('success', 'Appointment accepted successfully.');
    }

    public function createService()
    {
        return view('doctor.create-service');
    }

    public function storeService(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
        ]);

        Service::create([
            'doctor_id' => Auth::id(),
            'name' => $validated['name'],
            'description' => $validated['description'],
            'price' => $validated['price'],
        ]);

        return redirect()->route('doctor.services')
            ->with('success', 'Service added successfully.');
    }

    public function doctorBookings()
    {
        $bookings = Booking::with(['patient', 'service'])
            ->whereHas('service', function ($query) {
                $query->where('doctor_id', Auth::id());
            })
            ->orderBy('date', 'asc')
            ->orderBy('time', 'asc')
            ->get();

        return view('doctor.bookings', compact('bookings'));
    }
    public function edit(Booking $booking)
{
    if ($booking->patient_id != Auth::id()) {
        abort(403);
    }

    return view('patient.bookings.edit-booking', compact('booking'));
}
public function update(Request $request, Booking $booking)
{
    if ($booking->patient_id != Auth::id()) {
        abort(403);
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
        ->where('status', '!=', 'cancelled')
        ->exists();

    if ($exists) {
        return back()->withErrors([
            'time' => 'This appointment is already booked.'
        ])->withInput();
    }

    $booking->update($validated);

    return redirect()
        ->route('patient.my.bookings')
        ->with('success', 'Appointment updated successfully.');
}
}
