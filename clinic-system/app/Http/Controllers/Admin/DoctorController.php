<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\Specialization;
use Illuminate\Http\Request;
use App\Http\Requests\StoreDoctorRequest;
use App\Http\Requests\UpdateDoctorRequest;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class DoctorController extends Controller
{
    public function index(Request $request)
    {
        $query = Doctor::with(['user', 'specialization']);

        // Search
        if ($request->filled('search')) {
            $search = $request->search;

            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Filter by Specialization
        if ($request->filled('specialization')) {
            $query->where('specialization_id', $request->specialization);
        }

        // Filter by Status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $doctors = $query
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $specializations = Specialization::orderBy('name')->get();

        return view('admin.doctors.index', compact('doctors', 'specializations'));
    }


    /**
     * Show the form for creating a new resource.
     */


public function create()
{
    $specializations = Specialization::orderBy('name')
    ->pluck('name', 'id');

    return view('admin.doctors.create', compact('specializations'));
}

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreDoctorRequest $request)
{
    DB::beginTransaction();

    try {

        $imagePath = null;

        if ($request->hasFile('image')) {

            $imagePath = $request->file('image')->store('doctors', 'public');

        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => 'doctor',
        ]);

        Doctor::create([
            'user_id' => $user->id,
            'specialization_id' => $request->specialization_id,
            'gender' => $request->gender,
            'date_of_birth' => $request->date_of_birth,
            'experience_years' => $request->experience_years,
            'consultation_fee' => $request->consultation_fee,
            'address' => $request->address,
            'bio' => $request->bio,
            'image' => $imagePath,
            'status' => $request->boolean('status'),
        ]);

        DB::commit();

        return redirect()
            ->route('admin.doctors.index')
            ->with('success', 'Doctor created successfully.');

    } catch (\Exception $e) {

    DB::rollBack();

    if ($imagePath) {
        Storage::disk('public')->delete($imagePath);
    }

    dd($e->getMessage());
}
}

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Doctor $doctor)
{
    $doctor->load(['user', 'specialization']);

    $specializations = Specialization::orderBy('name')
    ->pluck('name', 'id');

    return view('admin.doctors.edit', compact('doctor', 'specializations'));
}

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateDoctorRequest $request, Doctor $doctor)
{
    DB::beginTransaction();

    try {

        $doctor->load('user');

        $imagePath = $doctor->image;

        if ($request->hasFile('image')) {

            if ($imagePath && Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);
            }

            $imagePath = $request->file('image')->store('doctors', 'public');
        }

        $doctor->user->update([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
        ]);

        if ($request->filled('password')) {

            $doctor->user->update([
                'password' => Hash::make($request->password),
            ]);
        }

        $doctor->update([
            'specialization_id' => $request->specialization_id,
            'gender' => $request->gender,
            'date_of_birth' => $request->date_of_birth,
            'experience_years' => $request->experience_years,
            'consultation_fee' => $request->consultation_fee,
            'address' => $request->address,
            'bio' => $request->bio,
            'image' => $imagePath,
            'status' => $request->boolean('status'),
        ]);

        DB::commit();

        return redirect()
            ->route('admin.doctors.index')
            ->with('success', 'Doctor updated successfully.');

    } catch (\Exception $e) {

        DB::rollBack();

        throw $e;
    }
}

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Doctor $doctor)
{
    DB::beginTransaction();

    try {

        $doctor->load('user');

        if ($doctor->image) {

            Storage::disk('public')->delete($doctor->image);

        }

        $doctor->delete();

        $doctor->user->delete();

        DB::commit();

        return redirect()
            ->route('admin.doctors.index')
            ->with('success', 'Doctor deleted successfully.');

    } catch (\Exception $e) {

        DB::rollBack();

        throw $e;

    }
}
}
