<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class PatientController extends Controller
{
    public function index()
    {
        $patients = Patient::with(['user'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($patients);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'gender' => 'nullable|in:male,female',
            'date_of_birth' => 'nullable|date',
            'blood_group' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'address' => 'nullable|string',
            'emergency_contact_name' => 'nullable|string',
            'emergency_contact_phone' => 'nullable|string',
            'medical_history' => 'nullable|string',
            'status' => 'boolean',
        ]);

        try {
            DB::beginTransaction();

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => 'patient',
            ]);

            $patient = Patient::create([
                'user_id' => $user->id,
                'gender' => $validated['gender'] ?? null,
                'date_of_birth' => $validated['date_of_birth'] ?? null,
                'blood_group' => $validated['blood_group'] ?? null,
                'address' => $validated['address'] ?? null,
                'emergency_contact_name' => $validated['emergency_contact_name'] ?? null,
                'emergency_contact_phone' => $validated['emergency_contact_phone'] ?? null,
                'medical_history' => $validated['medical_history'] ?? null,
                'status' => $validated['status'] ?? true,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Patient created successfully',
                'patient' => $patient->load(['user'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create patient',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Patient $patient)
    {
        return response()->json($patient->load(['user']));
    }

    public function update(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $patient->user_id,
            'gender' => 'nullable|in:male,female',
            'date_of_birth' => 'nullable|date',
            'blood_group' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'address' => 'nullable|string',
            'emergency_contact_name' => 'nullable|string',
            'emergency_contact_phone' => 'nullable|string',
            'medical_history' => 'nullable|string',
            'status' => 'boolean',
        ]);

        try {
            DB::beginTransaction();

            // Update user
            if (isset($validated['name']) || isset($validated['email'])) {
                $patient->user->update([
                    'name' => $validated['name'] ?? $patient->user->name,
                    'email' => $validated['email'] ?? $patient->user->email,
                ]);
            }

            // Update patient
            $patient->update($validated);

            DB::commit();

            return response()->json([
                'message' => 'Patient updated successfully',
                'patient' => $patient->fresh()->load(['user'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update patient',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Patient $patient)
    {
        try {
            DB::beginTransaction();
            
            $patient->user()->delete();
            $patient->delete();
            
            DB::commit();

            return response()->json([
                'message' => 'Patient deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to delete patient',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}