<?php

namespace App\Http\Controllers\Api\Receptionist;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class PatientController extends Controller
{
    /**
     * List patients. Optional ?status=pending|approved|rejected filter
     * for the approval queue; defaults to all.
     */
    public function index(Request $request)
    {
        $query = Patient::with('user')->orderBy('created_at', 'desc');

        if ($request->filled('approval_status')) {
            $query->where('approval_status', $request->approval_status);
        }

        return response()->json($query->get());
    }

    /**
     * Patients awaiting review — the receptionist dashboard's
     * "Pending Patient Registrations" queue.
     */
    public function pending()
    {
        return response()->json(
            Patient::with('user')->pending()->orderBy('created_at', 'asc')->get()
        );
    }

    /**
     * Search patients by name, email, or phone.
     */
    public function search(Request $request)
    {
        $request->validate(['q' => 'required|string|min:1']);
        $term = $request->q;

        $patients = Patient::with('user')
            ->whereHas('user', function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                  ->orWhere('email', 'like', "%{$term}%");
            })
            ->orWhere('phone', 'like', "%{$term}%")
            ->get();

        return response()->json($patients);
    }

    public function show(Patient $patient)
    {
        return response()->json($patient->load('user'));
    }

    /**
     * Approve a pending registration.
     */
    public function approve(Request $request, Patient $patient)
    {
        if ($patient->approval_status === 'approved') {
            return response()->json(['message' => 'Patient is already approved'], 400);
        }

        $patient->update([
            'approval_status' => 'approved',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
            'rejection_reason' => null,
        ]);

        // Optional email notification per the roadmap's Step 4 — left as
        // a hook rather than wired up, since no mail template/queue setup
        // was provided. Uncomment once a Notification/Mailable exists:
        // Mail::to($patient->user->email)->send(new PatientApproved($patient));

        return response()->json([
            'message' => 'Patient approved successfully',
            'data' => $patient->fresh()->load('user')
        ]);
    }

    /**
     * Reject a pending registration.
     */
    public function reject(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        if ($patient->approval_status === 'rejected') {
            return response()->json(['message' => 'Patient is already rejected'], 400);
        }

        $patient->update([
            'approval_status' => 'rejected',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
            'rejection_reason' => $validated['reason'] ?? null,
        ]);

        return response()->json([
            'message' => 'Patient registration rejected',
            'data' => $patient->fresh()->load('user')
        ]);
    }

    /**
     * Register a walk-in patient. Since a staff member is creating this
     * record in person (ID typically checked at the desk), the patient
     * is auto-approved rather than entering the pending queue.
     */
    public function registerWalkIn(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'nullable|string|min:8',
            'phone' => 'nullable|string|max:20',
            'gender' => 'required|in:male,female',
            'date_of_birth' => 'nullable|date',
            'blood_group' => 'nullable|string|max:10',
            'address' => 'nullable|string|max:500',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'allergies' => 'nullable|string|max:500',
            'chronic_diseases' => 'nullable|string|max:500',
            'medical_history' => 'nullable|string|max:1000',
        ]);

        try {
            DB::beginTransaction();

            // Walk-ins often don't set their own password at intake; give
            // them a random one and expect a "forgot password" flow (or a
            // receptionist-provided temporary password) later. Adjust if
            // you'd rather require the desk to set one explicitly.
            $password = $validated['password'] ?? bin2hex(random_bytes(8));

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'password' => Hash::make($password),
                'role' => 'patient',
            ]);

            $patient = Patient::create([
                'user_id' => $user->id,
                'phone' => $validated['phone'] ?? null,
                'gender' => $validated['gender'],
                'date_of_birth' => $validated['date_of_birth'] ?? null,
                'blood_group' => $validated['blood_group'] ?? null,
                'address' => $validated['address'] ?? null,
                'emergency_contact_name' => $validated['emergency_contact_name'] ?? null,
                'emergency_contact_phone' => $validated['emergency_contact_phone'] ?? null,
                'allergies' => $validated['allergies'] ?? 'None',
                'chronic_diseases' => $validated['chronic_diseases'] ?? 'None',
                'medical_history' => $validated['medical_history'] ?? 'None',
                'status' => true,
                'approval_status' => 'approved',
                'approved_by' => $request->user()->id,
                'approved_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Walk-in patient registered successfully',
                'patient' => $patient->load('user'),
                // Only returned when we generated it ourselves, so the desk
                // can hand it to the patient or set up their account.
                'generated_password' => isset($validated['password']) ? null : $password,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to register walk-in patient',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Edit patient details. Receptionists cannot delete patients per the
     * roadmap ("Receptionist Cannot: Delete Patients") — no destroy()
     * method here on purpose.
     */
    public function update(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $patient->user_id,
            'phone' => 'nullable|string|max:20',
            'gender' => 'nullable|in:male,female',
            'date_of_birth' => 'nullable|date',
            'blood_group' => 'nullable|string|max:10',
            'address' => 'nullable|string|max:500',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'status' => 'boolean',
        ]);

        try {
            DB::beginTransaction();

            if (isset($validated['name']) || isset($validated['email'])) {
                $patient->user->update([
                    'name' => $validated['name'] ?? $patient->user->name,
                    'email' => $validated['email'] ?? $patient->user->email,
                ]);
            }

            $patient->update(collect($validated)
                ->except(['name', 'email'])
                ->toArray());

            DB::commit();

            return response()->json([
                'message' => 'Patient updated successfully',
                'patient' => $patient->fresh()->load('user')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update patient',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
