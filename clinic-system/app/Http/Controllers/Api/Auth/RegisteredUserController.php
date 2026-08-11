<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Patient;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules;

class RegisteredUserController extends Controller
{
    public function create()
    {
        return view('auth.register');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:20',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'required|in:patient,doctor',
            
            // Patient fields
            'patient_gender' => 'nullable|in:male,female',
            'patient_date_of_birth' => 'nullable|date',
            'patient_blood_group' => 'nullable|string|max:10',
            'patient_address' => 'nullable|string|max:500',
            'patient_emergency_contact_name' => 'nullable|string|max:255',
            'patient_emergency_contact_phone' => 'nullable|string|max:20',
            'patient_allergies' => 'nullable|string|max:500',
            'patient_chronic_diseases' => 'nullable|string|max:500',
            'patient_medical_history' => 'nullable|string|max:1000',
            
            // Doctor fields
            'doctor_specialization_id' => 'required_if:role,doctor|exists:specializations,id',
            'doctor_gender' => 'required_if:role,doctor|in:male,female',
            'doctor_experience_years' => 'nullable|integer|min:0',
            'doctor_consultation_fee' => 'nullable|numeric|min:0',
        ]);

        DB::beginTransaction();

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
                'role' => $request->role,
            ]);

            if ($request->role === 'patient') {
                Patient::create([
                    'user_id' => $user->id,
                    'gender' => $request->patient_gender,
                    'date_of_birth' => $request->patient_date_of_birth,
                    'blood_group' => $request->patient_blood_group,
                    'address' => $request->patient_address,
                    'emergency_contact_name' => $request->patient_emergency_contact_name,
                    'emergency_contact_phone' => $request->patient_emergency_contact_phone,
                    'allergies' => $request->patient_allergies ?? 'None',
                    'chronic_diseases' => $request->patient_chronic_diseases ?? 'None',
                    'medical_history' => $request->patient_medical_history ?? 'None',
                    'status' => true,
                    // Phase 5: self-registered patients start pending and
                    // are reviewed by a receptionist. See Patient
                    // Registration Workflow in the roadmap.
                    'approval_status' => 'pending',
                ]);
            } else {
                Doctor::create([
                    'user_id' => $user->id,
                    'specialization_id' => $request->doctor_specialization_id,
                    'gender' => $request->doctor_gender,
                    'experience_years' => $request->doctor_experience_years ?? 0,
                    'consultation_fee' => $request->doctor_consultation_fee ?? 0,
                    'status' => true,
                ]);
            }

            DB::commit();

            // Patients cannot log in until approved (see
            // AuthenticatedSessionController), so don't auto-login them —
            // send them back to a confirmation state instead. Doctors have
            // no approval workflow in this phase, so their behavior is
            // unchanged.
            if ($request->role === 'patient') {
                return redirect()->route('login')->with(
                    'status',
                    'Thanks for registering! Your account is pending review by our staff. '
                    . 'You will be able to log in once it has been approved.'
                );
            }

            auth()->login($user);

            return redirect()->route('dashboard');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors([
                'error' => 'Registration failed: ' . $e->getMessage()
            ])->withInput();
        }
    }
}