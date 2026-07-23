<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Specialization;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): View
    {
        $specializations = Specialization::orderBy('name')->pluck('name', 'id');

        return view('auth.register', compact('specializations'));
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'phone' => ['nullable', 'string', 'max:255', 'unique:users,phone'],
            'role' => ['required', 'in:doctor,patient'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'role' => $request->role,
            'password' => Hash::make($request->password),
        ]);

        if ($request->role === 'doctor') {
            Doctor::create([
                'user_id' => $user->id,
                'specialization_id' => $request->specialization_id ?: Specialization::first()?->id,
                'gender' => $request->doctor_gender ?: 'male',
                'date_of_birth' => $request->doctor_dob,
                'experience_years' => $request->experience_years ?: 0,
                'consultation_fee' => $request->consultation_fee ?: 0,
                'address' => $request->doctor_address,
                'bio' => $request->bio,
                'status' => true,
            ]);
        } elseif ($request->role === 'patient') {
            Patient::create([
                'user_id' => $user->id,
                'gender' => $request->patient_gender,
                'date_of_birth' => $request->date_of_birth,
                'blood_group' => $request->blood_group,
                'address' => $request->patient_address,
                'emergency_contact_name' => $request->emergency_contact_name,
                'emergency_contact_phone' => $request->emergency_contact_phone,
                'medical_history' => $request->medical_history,
                'status' => true,
            ]);
        }

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}