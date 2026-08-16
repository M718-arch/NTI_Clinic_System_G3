<?php

namespace App\Http\Controllers\Api;

use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;

class ServiceController extends Controller
{
    /**
     * Show the form for creating a new service (Web)
     */
    public function create()
    {
        return view('services.create');
    }

    /**
     * Store a newly created service (Web)
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'duration' => 'nullable|integer|min:5|max:480',
            'is_active' => 'sometimes|boolean',
        ]);

        $doctor = auth()->user()->doctor;

        Service::create([
            'doctor_id' => $doctor->id, // Doctor's own id, not user id
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price ?? 0,
            'duration' => $request->duration ?? 30,
            'is_active' => $request->is_active ?? true,
        ]);

        return redirect()->route('doctor.dashboard')->with('success', 'Service added successfully!');
    }

    /**
     * Get all services for the authenticated doctor (API)
     */
    public function myServices()
    {
        try {
            $doctor = auth()->user()->doctor;

            if (!$doctor) {
                if (request()->wantsJson()) {
                    return response()->json([
                        'message' => 'Doctor profile not found'
                    ], 404);
                }
                return redirect()->back()->with('error', 'Doctor profile not found');
            }

            $services = Service::where('doctor_id', $doctor->id)
                ->withCount('bookings')
                ->orderBy('name')
                ->get();

            // If it's an API request, return JSON
            if (request()->wantsJson()) {
                return response()->json($services);
            }

            // If it's a web request, return view
            return view('doctor.dashboard', compact('services'));

        } catch (\Exception $e) {
            \Log::error('Services fetch error: ' . $e->getMessage());
            if (request()->wantsJson()) {
                return response()->json([
                    'message' => 'Error fetching services',
                    'error' => $e->getMessage()
                ], 500);
            }
            return redirect()->back()->with('error', 'Error fetching services');
        }
    }

    /**
     * Get all services for patients (API - Public)
     */
    public function index()
    {
        try {
            $services = Service::with(['doctor', 'doctor.user'])
                ->where('is_active', true)
                ->orderBy('name')
                ->get();

            if (request()->wantsJson()) {
                return response()->json($services);
            }

            return view('services.index', compact('services'));

        } catch (\Exception $e) {
            \Log::error('Services index error: ' . $e->getMessage());
            if (request()->wantsJson()) {
                return response()->json([
                    'message' => 'Error fetching services',
                    'error' => $e->getMessage()
                ], 500);
            }
            return redirect()->back()->with('error', 'Error fetching services');
        }
    }

    /**
     * Store a new service (API)
     */
    public function storeApi(Request $request)
    {
        try {
            $doctor = auth()->user()->doctor;

            if (!$doctor) {
                return response()->json([
                    'message' => 'Doctor profile not found'
                ], 404);
            }

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'price' => 'required|numeric|min:0',
                'duration' => 'required|integer|min:5|max:480',
                'is_active' => 'boolean',
            ]);

            $service = Service::create([
                'doctor_id' => $doctor->id,
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'price' => $validated['price'],
                'duration' => $validated['duration'],
                'is_active' => $validated['is_active'] ?? true,
            ]);

            return response()->json([
                'message' => 'Service created successfully',
                'data' => $service
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Service creation error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error creating service',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a service (API)
     */
    public function updateApi(Request $request, Service $service)
    {
        try {
            $doctor = auth()->user()->doctor;

            if (!$doctor || $service->doctor_id !== $doctor->id) {
                return response()->json([
                    'message' => 'Unauthorized'
                ], 403);
            }

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'price' => 'sometimes|numeric|min:0',
                'duration' => 'sometimes|integer|min:5|max:480',
                'is_active' => 'boolean',
            ]);

            $service->update($validated);

            return response()->json([
                'message' => 'Service updated successfully',
                'data' => $service
            ]);

        } catch (\Exception $e) {
            \Log::error('Service update error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error updating service',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a service (Web)
     */
    public function destroy(Service $service)
    {
        $doctor = auth()->user()->doctor;

        if (!$doctor || $service->doctor_id !== $doctor->id) {
            abort(403);
        }

        if ($service->bookings()->exists()) {
            return back()->with('error', 'You cannot delete a service that has bookings.');
        }

        $service->delete();
        return redirect()->route('doctor.dashboard')->with('success', 'Service deleted successfully.');
    }

    /**
     * Delete a service (API)
     */
    public function destroyApi(Service $service)
    {
        try {
            $doctor = auth()->user()->doctor;

            if (!$doctor || $service->doctor_id !== $doctor->id) {
                return response()->json([
                    'message' => 'Unauthorized'
                ], 403);
            }

            if ($service->bookings()->exists()) {
                return response()->json([
                    'message' => 'Cannot delete service that has bookings'
                ], 400);
            }

            $service->delete();

            return response()->json([
                'message' => 'Service deleted successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Service deletion error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error deleting service',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show edit form (Web)
     */
    public function edit(Service $service)
    {
        $doctor = auth()->user()->doctor;

        if (!$doctor || $service->doctor_id !== $doctor->id) {
            abort(403);
        }
        return view('services.edit', compact('service'));
    }

    /**
     * Update a service (Web)
     */
    public function update(Request $request, Service $service)
    {
        $doctor = auth()->user()->doctor;

        if (!$doctor || $service->doctor_id !== $doctor->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'duration' => 'nullable|integer|min:5|max:480',
            'is_active' => 'sometimes|boolean',
        ]);

        $service->update($validated);
        return redirect()->route('doctor.dashboard')->with('success', 'Service updated successfully.');
    }

    /**
     * Show a single service (API)
     */
    public function show(Service $service)
    {
        try {
            $service->load(['doctor', 'doctor.user']);

            return response()->json([
                'id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'price' => $service->price,
                'formatted_price' => '$' . number_format($service->price, 2),
                'duration' => $service->duration,
                'doctor_name' => $service->doctor->full_name ?? 'Unknown',
                'doctor_id' => $service->doctor_id,
                'clinic_name' => $service->doctor->clinic_name ?? 'N/A',
                'is_active' => $service->is_active,
            ]);

        } catch (\Exception $e) {
            \Log::error('Service show error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching service',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}