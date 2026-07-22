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

        return view('dashboard.doctor', compact('services'));
    }

    // Patient: list all available services with doctor info
    public function index()
{
    $services = Service::with('doctor')->get();

    return view('services.index', compact('services'));
}

}