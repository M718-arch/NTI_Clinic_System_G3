<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\ProfileController;

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

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth'])->group(function () {

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