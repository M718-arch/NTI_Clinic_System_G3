<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DoctorController;
use App\Http\Controllers\Admin\PatientController;
use App\Http\Controllers\Admin\ReportController;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Booking;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    // Featured doctors — active only, with their specialization loaded
    $doctors = Doctor::query()
        ->active()
        ->with('specialization')
        ->latest()
        ->take(3)
        ->get();

    // Live counts for the hero card + animated stats section
    $stats = [
        'doctors'      => Doctor::active()->count(),
        'patients'     => Patient::count(),
        'appointments' => Booking::count(),
    ];

    return view('welcome', compact('doctors', 'stats'));
})->name('home');

Route::get('/dashboard', function () {
    $user = auth()->user();

    if (!$user) {
        return redirect()->route('login');
    }

    return match($user->role) {
        'admin' => redirect()->route('admin.dashboard'),
        'doctor' => redirect()->route('doctor.dashboard'),
        'patient' => redirect()->route('patient.dashboard'),
        default => redirect('/'),
    };
})->middleware(['auth'])->name('dashboard');

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth'])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Booking actions shared across roles
    |--------------------------------------------------------------------------
    */

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
            Route::get('/{any?}', function () {
                return view('patient.dashboard');
            })->where('any', '.*')->name('dashboard');

            Route::resource('doctors', DoctorController::class);
            Route::resource('patients', PatientController::class);

            Route::get('/appointments', [AppointmentController::class, 'adminAppointments'])
                ->name('appointments.index');

            Route::get('/reports', [ReportController::class, 'index'])
                ->name('reports.index');
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
                return view('patient.dashboard');
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
                return view('patient.dashboard');
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