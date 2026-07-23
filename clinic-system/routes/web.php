<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AppointmentController;

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DoctorController;
use App\Http\Controllers\Admin\PatientController;
use App\Http\Controllers\Admin\ReportController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return view('welcome');
})->name('home');

Route::get('/dashboard', function () {
    $user = auth();

    if ($user->role() === 'admin') {
        return redirect()->route('admin.dashboard');
    } elseif ($user->role() === 'doctor') {
        return redirect()->route('doctor.dashboard');
    }

    return redirect()->route('patient.dashboard');
})->middleware(['auth'])->name('dashboard');

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth'])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Booking actions shared across roles (auth handled inside controller)
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

            Route::get('/', [DashboardController::class, 'index'])
                ->name('dashboard');

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

            Route::get('/', [ServiceController::class, 'myServices'])
                ->name('dashboard');

            Route::get('/services/create', [ServiceController::class, 'create'])
                ->name('services.create');

            Route::post('/services', [ServiceController::class, 'store'])
                ->name('services.store');

            Route::get('/bookings', [AppointmentController::class, 'doctorBookings'])
                ->name('bookings.index');
            Route::delete('/services/{service}', [ServiceController::class, 'destroy'])
                ->name('services.destroy');
            Route::get('/services/{service}/edit', [ServiceController::class, 'edit'])
                ->name('services.edit');

        Route::put('/services/{service}', [ServiceController::class, 'update'])
            ->name('services.update');
        });

    /*
    |--------------------------------------------------------------------------
    | Patient Routes
    |--------------------------------------------------------------------------
    */

    Route::prefix('patient')
        ->name('patient.')
        ->middleware('role:patient')
        ->group(function () {

            Route::view('/', 'patient.dashboard')
                ->name('dashboard');

            Route::get('/services', [ServiceController::class, 'index'])
                ->name('services.index');

            Route::get('/book/{service}', [AppointmentController::class, 'create'])
                ->name('book.create');

            Route::post('/book/{service}', [AppointmentController::class, 'store'])
                ->name('book.store');

            Route::get('/my-bookings', [AppointmentController::class, 'myBookings'])
                ->name('my.bookings');
            Route::get('/my-bookings/{booking}/edit', [AppointmentController::class, 'edit'])
    ->name('bookings.edit');

Route::put('/my-bookings/{booking}', [AppointmentController::class, 'update'])
    ->name('bookings.update');
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
