<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    // Show the "Add Service" form
    public function create()
    {
        return view('services.create');
    }

    // Save a new service, owned by the logged-in doctor
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        Service::create([
            'doctor_id' => auth()->id(),
            'name' => $request->name,
            'description' => $request->description,
        ]);

        return redirect()->route('doctor.dashboard')->with('success', 'Service added successfully!');
    }

    // Doctor's dashboard: list their own services + patient counts
    public function myServices()
    {
        $services = Service::where('doctor_id', auth()->id())
            ->withCount('bookings')
            ->get();

        return view('doctor.dashboard', compact('services'));
    }

    // Patient: list all available services with doctor info
    public function index()
{
    $services = Service::with('doctor')->get();

    return view('services.index', compact('services'));
}
public function destroy(Service $service)
{
    if ($service->doctor_id !== auth()->id()) {
        abort(403);
    }

    if ($service->appointments()->exists()) {
        return back()->with('error', 'You cannot delete a service that has bookings.');
    }

    $service->delete();

    return redirect()
        ->route('doctor.dashboard')
        ->with('success', 'Service deleted successfully.');
}
public function edit(Service $service)
{
    if ($service->doctor_id != auth()->id()) {
        abort(403);
    }

    return view('services.edit', compact('service'));
}
public function update(Request $request, Service $service)
{
    if ($service->doctor_id != auth()->id()) {
        abort(403);
    }

    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'description' => 'required|string',
    ]);

    $service->update($validated);

    return redirect()
        ->route('doctor.dashboard')
        ->with('success', 'Service updated successfully.');
}
}
