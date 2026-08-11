<?php
// app/Http/Controllers/Api/Admin/ReceptionistController.php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class ReceptionistController extends Controller
{
    public function index()
    {
        try {
            $receptionists = User::where('role', 'receptionist')
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'user_id' => $user->id,
                        'full_name' => $user->name,
                        'name' => $user->name,
                        'email' => $user->email,
                        'phone' => $user->phone ?? '',
                        'status' => $user->status === 'active' ? true : false,
                        'user' => [
                            'id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                            'phone' => $user->phone ?? '',
                        ],
                        'created_at' => $user->created_at,
                    ];
                });

            return response()->json($receptionists);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error fetching receptionists: ' . $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:8',
                'phone' => 'nullable|string|max:20',
                'first_name' => 'nullable|string|max:255',
                'last_name' => 'nullable|string|max:255',
            ]);

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => 'receptionist',
                'phone' => $validated['phone'] ?? null,
                'status' => 'active',
            ]);

            return response()->json([
                'message' => 'Receptionist created successfully',
                'receptionist' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'status' => true,
                    'user' => $user,
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error creating receptionist: ' . $e->getMessage()], 500);
        }
    }

    public function show(User $receptionist)
    {
        try {
            if ($receptionist->role !== 'receptionist') {
                return response()->json(['message' => 'User is not a receptionist'], 404);
            }
            return response()->json([
                'id' => $receptionist->id,
                'name' => $receptionist->name,
                'email' => $receptionist->email,
                'phone' => $receptionist->phone,
                'status' => $receptionist->status === 'active',
                'user' => $receptionist,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error fetching receptionist: ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, User $receptionist)
    {
        try {
            if ($receptionist->role !== 'receptionist') {
                return response()->json(['message' => 'User is not a receptionist'], 404);
            }

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'phone' => 'nullable|string|max:20',
                'status' => ['sometimes', 'boolean'],
                'email' => 'sometimes|email|unique:users,email,' . $receptionist->id,
            ]);

            if (isset($validated['status'])) {
                $validated['status'] = $validated['status'] ? 'active' : 'inactive';
            }

            $receptionist->update($validated);

            return response()->json([
                'message' => 'Receptionist updated successfully',
                'receptionist' => [
                    'id' => $receptionist->id,
                    'name' => $receptionist->name,
                    'email' => $receptionist->email,
                    'phone' => $receptionist->phone,
                    'status' => $receptionist->status === 'active',
                    'user' => $receptionist,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error updating receptionist: ' . $e->getMessage()], 500);
        }
    }

    public function destroy(User $receptionist)
    {
        try {
            if ($receptionist->role !== 'receptionist') {
                return response()->json(['message' => 'User is not a receptionist'], 404);
            }

            $receptionist->delete();

            return response()->json(['message' => 'Receptionist deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error deleting receptionist: ' . $e->getMessage()], 500);
        }
    }
}