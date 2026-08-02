<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DoctorController extends Controller
{
    public function index()
    {
        $doctors = Doctor::with(['user', 'specialization'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($doctors);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'specialization_id' => 'required|exists:specializations,id',
            'gender' => 'required|in:male,female',
            'date_of_birth' => 'nullable|date',
            'experience_years' => 'nullable|integer|min:0',
            'consultation_fee' => 'nullable|numeric|min:0',
            'address' => 'nullable|string',
            'bio' => 'nullable|string',
            'status' => 'boolean',
        ]);

        try {
            DB::beginTransaction();

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => 'doctor',
            ]);

            $doctor = Doctor::create([
                'user_id' => $user->id,
                'specialization_id' => $validated['specialization_id'],
                'gender' => $validated['gender'],
                'date_of_birth' => $validated['date_of_birth'] ?? null,
                'experience_years' => $validated['experience_years'] ?? 0,
                'consultation_fee' => $validated['consultation_fee'] ?? 0,
                'address' => $validated['address'] ?? null,
                'bio' => $validated['bio'] ?? null,
                'status' => $validated['status'] ?? true,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Doctor created successfully',
                'doctor' => $doctor->load(['user', 'specialization'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create doctor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Doctor $doctor)
    {
        return response()->json($doctor->load(['user', 'specialization']));
    }

    public function update(Request $request, Doctor $doctor)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $doctor->user_id,
            'specialization_id' => 'sometimes|exists:specializations,id',
            'gender' => 'sometimes|in:male,female',
            'date_of_birth' => 'nullable|date',
            'experience_years' => 'nullable|integer|min:0',
            'consultation_fee' => 'nullable|numeric|min:0',
            'address' => 'nullable|string',
            'bio' => 'nullable|string',
            'status' => 'boolean',
        ]);

        try {
            DB::beginTransaction();

            // Update user
            if (isset($validated['name']) || isset($validated['email'])) {
                $doctor->user->update([
                    'name' => $validated['name'] ?? $doctor->user->name,
                    'email' => $validated['email'] ?? $doctor->user->email,
                ]);
            }

            // Update doctor
            $doctor->update($validated);

            DB::commit();

            return response()->json([
                'message' => 'Doctor updated successfully',
                'doctor' => $doctor->fresh()->load(['user', 'specialization'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update doctor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Doctor $doctor)
    {
        try {
            DB::beginTransaction();
            
            $doctor->user()->delete();
            $doctor->delete();
            
            DB::commit();

            return response()->json([
                'message' => 'Doctor deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to delete doctor',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}