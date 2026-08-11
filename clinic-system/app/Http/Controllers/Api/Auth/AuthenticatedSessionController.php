<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle an incoming authentication request.
     */
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

    if ($user->role === 'patient') {
        $patient = $user->patient;

        if ($patient && $patient->approval_status === 'pending') {
            throw ValidationException::withMessages([
                'email' => ['Your account is pending approval by our staff. You will be able to log in once it is reviewed.'],
            ]);
        }

        if ($patient && $patient->approval_status === 'rejected') {
            throw ValidationException::withMessages([
                'email' => ['Your registration was not approved. Please contact the clinic for more information.'],
            ]);
        }
    }

    // Actually authenticate the session as THIS user, replacing whatever
    // (if anything) the session cookie was previously tied to.
    Auth::login($user);
    $request->session()->regenerate();

    // Token kept for now since other parts of the app may reference it,
    // but note the frontend currently authenticates via session cookie,
    // not this token — see note below.
    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'message' => 'Login successful',
        'user' => $user->load(['doctor', 'patient', 'receptionist']),
        'token' => $token,
        'role' => $user->role,
    ]);
}

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request)
{
    $user = $request->user();

    if ($user) {
        $user->tokens()->delete();
    }

    // Fully log out the web guard: this also clears the recaller cookie
    // from the internal queue, but we don't trust that queue to flush here.
    Auth::guard('web')->logout();

    $request->session()->invalidate();
    $request->session()->regenerateToken();

    // Explicitly attach cookie removals to THIS response instead of
    // relying on AddQueuedCookiesToResponse (which the api stack may skip).
    $recallerName = Auth::guard('web')->getRecallerName(); // e.g. remember_web_<hash>
    $sessionCookieName = config('session.cookie');

    return response()->json(['message' => 'Logged out successfully'])
        ->withCookie(cookie()->forget($sessionCookieName, config('session.path'), config('session.domain')))
        ->withCookie(cookie()->forget($recallerName, config('session.path'), config('session.domain')))
        ->withCookie(cookie()->forget('XSRF-TOKEN', config('session.path'), config('session.domain')));
}

    /**
     * Get the authenticated user.
     */
    public function user(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'doctor' => $user->doctor,
            'patient' => $user->patient,
            'receptionist' => $user->receptionist,
        ]);
    }
}