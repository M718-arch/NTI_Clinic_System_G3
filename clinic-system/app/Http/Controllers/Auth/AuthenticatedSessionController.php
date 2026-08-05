<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthenticatedSessionController extends Controller
{
    public function create()
    {
        return view('auth.login');
    }

    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        auth()->login($user);
        $request->session()->regenerate();

        // Redirect based on role
        return match ($user->role) {
            'admin' => redirect()->intended(route('admin.dashboard')),
            'doctor' => redirect()->intended(route('doctor.dashboard')),
            'patient' => redirect()->intended('/'),
            default => redirect('/'),
        };
    }

    public function destroy(Request $request)
    {
        auth()->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    // This method is only for API
    public function user(Request $request)
    {
        return response()->json(
            $request->user()->load(['doctor', 'patient'])
        );
    }
}