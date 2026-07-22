<?php

namespace App\Http\Controllers\Admin;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Http\Requests\StorePatientRequest;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\UpdatePatientRequest;
class PatientController extends Controller
{
    public function index()
    {
        $patients = Patient::with('user')
            ->when(request('search'), function ($query) {
                $query->whereHas('user', function ($q) {
                    $q->where('name', 'like', '%' . request('search') . '%')
                      ->orWhere('email', 'like', '%' . request('search') . '%')
                      ->orWhere('phone', 'like', '%' . request('search') . '%');
                });
            })
            ->when(request()->filled('status'), function ($query) {
                $query->where('status', request('status'));
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return view('admin.patients.index', compact('patients'));
    }

    public function create()
    {
        return view('admin.patients.create');
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePatientRequest $request)
{
    DB::beginTransaction();

    try {

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => 'patient',
        ]);

        Patient::create([
            'user_id' => $user->id,
            'gender' => $request->gender,
            'date_of_birth' => $request->date_of_birth,
            'blood_group' => $request->blood_group,
            'address' => $request->address,
            'emergency_contact_name' => $request->emergency_contact_name,
            'emergency_contact_phone' => $request->emergency_contact_phone,
            'medical_history' => $request->medical_history,
            'status' => $request->status,
        ]);

        DB::commit();

        return redirect()
            ->route('admin.patients.index')
            ->with('success', 'Patient created successfully.');

    } catch (\Exception $e) {

        DB::rollBack();

        return back()
            ->withInput()
            ->with('error', $e->getMessage());
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
    public function edit(Patient $patient)
{
    $patient->load('user');

    return view('admin.patients.edit', compact('patient'));
}

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePatientRequest $request, Patient $patient)
{
    DB::beginTransaction();

    try {

        $user = $patient->user;

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
        ]);

        if ($request->filled('password')) {

            $user->update([
                'password' => Hash::make($request->password),
            ]);

        }

        $patient->update([
            'gender' => $request->gender,
            'date_of_birth' => $request->date_of_birth,
            'blood_group' => $request->blood_group,
            'address' => $request->address,
            'emergency_contact_name' => $request->emergency_contact_name,
            'emergency_contact_phone' => $request->emergency_contact_phone,
            'medical_history' => $request->medical_history,
            'status' => $request->status,
        ]);

        DB::commit();

        return redirect()
            ->route('admin.patients.index')
            ->with('success', 'Patient updated successfully.');

    } catch (\Exception $e) {

        DB::rollBack();

        return back()
            ->withInput()
            ->with('error', $e->getMessage());

    }
}

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Patient $patient)
{
    $patient->user()->delete();

    return redirect()
        ->route('admin.patients.index')
        ->with('success', 'Patient deleted successfully.');
}
}
