<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\Admin\DoctorController;
use App\Http\Controllers\Api\Admin\PatientController;
use App\Http\Controllers\Api\Admin\ReceptionistController;
use App\Http\Controllers\Api\Admin\ReportController;
use App\Http\Controllers\Api\Admin\SpecializationController;
use App\Http\Controllers\Api\Admin\BillingController;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Booking;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    $doctors = Doctor::query()
        ->active()
        ->with('specialization')
        ->latest()
        ->take(3)
        ->get();

    $stats = [
        'doctors'      => Doctor::active()->count(),
        'patients'     => Patient::count(),
        'appointments' => Booking::count(),
    ];

    return view('welcome', compact('doctors', 'stats'));
})->name('home');

// Login page - Blade view (no React) - Add guest middleware
Route::get('/login', function () {
    return view('auth.login');
})->middleware('guest')->name('login');

// Logout route - Add proper logout handling
Route::post('/logout', function (Request $request) {
    auth()->logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();
    return redirect('/login');
})->name('logout');

// Also add a GET logout route for testing (remove in production)
Route::get('/logout', function (Request $request) {
    auth()->logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();
    return redirect('/login');
})->name('logout.get');

Route::get('/dashboard', function () {
    $user = auth()->user();

    if (!$user) {
        return redirect()->route('login');
    }

    return match($user->role) {
        'admin' => redirect()->route('admin.dashboard'),
        'doctor' => redirect()->route('doctor.dashboard'),
        'patient' => redirect()->route('patient.dashboard'),
        'receptionist' => redirect()->route('receptionist.dashboard'),
        default => redirect('/'),
    };
})->middleware(['auth'])->name('dashboard');

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth'])->group(function () {

    // These routes now use the correct Api\AppointmentController
    Route::patch('/bookings/{booking}/cancel', [AppointmentController::class, 'cancel'])
        ->name('bookings.cancel');
    Route::patch('/bookings/{booking}/accept', [AppointmentController::class, 'accept'])
        ->name('bookings.accept');

    /*
    |--------------------------------------------------------------------------
    | Admin Routes
    |--------------------------------------------------------------------------
    */

    Route::prefix('admin')
        ->name('admin.')
        ->middleware('role:admin')
        ->group(function () {
            // API Routes for admin - using correct controllers
            Route::get('/doctors', [DoctorController::class, 'index'])->name('doctors.index');
            Route::post('/doctors', [DoctorController::class, 'store'])->name('doctors.store');
            Route::get('/doctors/{doctor}', [DoctorController::class, 'show'])->name('doctors.show');
            Route::put('/doctors/{doctor}', [DoctorController::class, 'update'])->name('doctors.update');
            Route::delete('/doctors/{doctor}', [DoctorController::class, 'destroy'])->name('doctors.destroy');

            Route::get('/patients', [PatientController::class, 'index'])->name('patients.index');
            Route::post('/patients', [PatientController::class, 'store'])->name('patients.store');
            Route::get('/patients/{patient}', [PatientController::class, 'show'])->name('patients.show');
            Route::put('/patients/{patient}', [PatientController::class, 'update'])->name('patients.update');
            Route::delete('/patients/{patient}', [PatientController::class, 'destroy'])->name('patients.destroy');

            Route::get('/receptionists', [ReceptionistController::class, 'index'])->name('receptionists.index');
            Route::post('/receptionists', [ReceptionistController::class, 'store'])->name('receptionists.store');
            Route::get('/receptionists/{receptionist}', [ReceptionistController::class, 'show'])->name('receptionists.show');
            Route::put('/receptionists/{receptionist}', [ReceptionistController::class, 'update'])->name('receptionists.update');
            Route::delete('/receptionists/{receptionist}', [ReceptionistController::class, 'destroy'])->name('receptionists.destroy');

            Route::get('/appointments', [AppointmentController::class, 'adminAppointments'])->name('appointments.index');
            Route::get('/appointments/{booking}', [AppointmentController::class, 'show'])->name('appointments.show');
            Route::patch('/appointments/{booking}/status', [AppointmentController::class, 'updateStatus'])->name('appointments.status');
            Route::patch('/appointments/{booking}/cancel', [AppointmentController::class, 'cancel'])->name('appointments.cancel');

            Route::get('/reports/overview', [ReportController::class, 'index'])->name('reports.overview');
            Route::get('/specializations', [SpecializationController::class, 'index'])->name('specializations.index');
            
            Route::get('/billing/summary', [BillingController::class, 'summary'])->name('billing.summary');
            Route::get('/billing/invoices', [BillingController::class, 'invoices'])->name('billing.invoices');

            // Catch-all route for React SPA - must be last
            Route::get('/{any?}', function () {
                return view('layouts.app');
            })->where('any', '.*')->name('dashboard');
        });

    /*
    |--------------------------------------------------------------------------
    | Doctor Routes
    |--------------------------------------------------------------------------
    */

    Route::prefix('doctor')
        ->name('doctor.')
        ->middleware('role:doctor')
        ->group(function () {
            // Catch-all route for React - must be last
            Route::get('/{any?}', function () {
                return view('layouts.app');
            })->where('any', '.*')->name('dashboard');
        });

    /*
    |--------------------------------------------------------------------------
    | Patient Routes (React)
    |--------------------------------------------------------------------------
    */

    Route::prefix('patient')
        ->name('patient.')
        ->middleware('role:patient')
        ->group(function () {
            // Catch-all route for React - must be last
            Route::get('/{any?}', function () {
                return view('layouts.app');
            })->where('any', '.*')->name('dashboard');
        });

    /*
    |--------------------------------------------------------------------------
    | Receptionist Routes (React) — Phase 5
    |--------------------------------------------------------------------------
    */

    Route::prefix('receptionist')
        ->name('receptionist.')
        ->middleware('role:receptionist')
        ->group(function () {
            // Catch-all route for React - must be last
            Route::get('/{any?}', function () {
                return view('layouts.app');
            })->where('any', '.*')->name('dashboard');
        });

    /*
    |--------------------------------------------------------------------------
    | Profile
    |--------------------------------------------------------------------------
    */

    Route::get('/profile', [ProfileController::class, 'edit'])
        ->name('profile.edit');

    Route::patch('/profile', [ProfileController::class, 'update'])
        ->name('profile.update');

    Route::delete('/profile', [ProfileController::class, 'destroy'])
        ->name('profile.destroy');
});

require __DIR__.'/auth.php';