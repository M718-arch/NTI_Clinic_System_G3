<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\AppointmentController;


Route::get('/', function () {
    return view('welcome');
});

Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Doctor routes
    Route::get('/doctor/dashboard', [ServiceController::class, 'myServices'])->name('doctor.dashboard');
    Route::get('/services/create', [ServiceController::class, 'create'])->name('services.create');
    Route::post('/services', [ServiceController::class, 'store'])->name('services.store');

    // Patient Routes
    Route::get('/services', [ServiceController::class, 'index'])->name('services.index');
    Route::get('/book/{service}', [AppointmentController::class, 'create'])->name('book.create');
    Route::post('/book/{service}', [AppointmentController::class, 'store'])->name('book.store');
    Route::get('/my-bookings', [AppointmentController::class, 'myBookings'])
    ->name('my.bookings');
});

require __DIR__.'/auth.php';

