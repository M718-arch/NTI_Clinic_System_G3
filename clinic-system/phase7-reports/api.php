<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\Admin\DoctorController as AdminDoctorController;
use App\Http\Controllers\Api\Admin\PatientController as AdminPatientController;
use App\Http\Controllers\Api\Admin\ReceptionistController as AdminReceptionistController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\ReceptionistController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\Receptionist\PatientController as ReceptionistPatientController;
use App\Http\Controllers\Api\Receptionist\AppointmentController as ReceptionistAppointmentController;
use App\Http\Controllers\Api\Receptionist\InvoiceController as ReceptionistInvoiceController;
use App\Http\Controllers\Api\Admin\BillingController as AdminBillingController;
use App\Http\Controllers\Api\Admin\ReportController as AdminReportController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ========== PUBLIC ROUTES ==========
Route::post('/login', [AuthenticatedSessionController::class, 'store']);
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth:sanctum');

// ========== PROTECTED ROUTES ==========
Route::middleware('auth:sanctum')->group(function () {
    
    // Get authenticated user
    Route::get('/user', [AuthenticatedSessionController::class, 'user']);
    
    // Dashboard stats
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // ===== MESSAGE ROUTES (accessible to both doctor and patient) =====
    Route::prefix('messages')->group(function () {
        Route::get('/conversations', [MessageController::class, 'conversations']);
        Route::get('/{conversation}', [MessageController::class, 'messages']);
        Route::post('/send', [MessageController::class, 'send']);
        Route::post('/{conversation}/read', [MessageController::class, 'markAsRead']);
    });

    // ===== DOCTOR ROUTES =====
    Route::prefix('doctor')->middleware('role:doctor')->group(function () {
        // Profile Management
        Route::get('/profile', [DoctorController::class, 'profile']);
        Route::put('/profile', [DoctorController::class, 'updateProfile']);
        Route::put('/password', [DoctorController::class, 'updatePassword']);
        Route::put('/clinic', [DoctorController::class, 'updateClinic']);
        
        // Image Management
        Route::post('/image', [DoctorController::class, 'uploadImage']);
        Route::delete('/image', [DoctorController::class, 'deleteImage']);
        
        // Availability
        Route::get('/availability', [DoctorController::class, 'getAvailability']);
        Route::put('/availability', [DoctorController::class, 'updateAvailability']);
        
        // Statistics
        Route::get('/stats', [DoctorController::class, 'getStats']);
        
        // Patients
        Route::get('/patients', [DoctorController::class, 'getPatients']);
        
        // Notification Preferences
        Route::get('/notifications', [DoctorController::class, 'getNotificationPreferences']);
        Route::put('/notifications', [DoctorController::class, 'updateNotifications']);
        
        // Services
        Route::get('/services', [ServiceController::class, 'myServices']);
        Route::post('/services', [ServiceController::class, 'store']);
        Route::put('/services/{service}', [ServiceController::class, 'update']);
        Route::delete('/services/{service}', [ServiceController::class, 'destroy']);
        
        // Bookings
        Route::get('/bookings', [AppointmentController::class, 'doctorBookings']);
        Route::put('/bookings/{booking}', [AppointmentController::class, 'updateByDoctor']);
        Route::patch('/bookings/{booking}/accept', [AppointmentController::class, 'accept']);
        Route::patch('/bookings/{booking}/cancel', [AppointmentController::class, 'cancel']);
        Route::patch('/bookings/{booking}/status', [AppointmentController::class, 'updateStatus']);

        // Invoices — Phase 6, payment status view only (see
        // DoctorController::getInvoices patch note re: no revenue access).
        Route::get('/invoices', [DoctorController::class, 'getInvoices']);
    });

    // ===== PATIENT ROUTES =====
    Route::prefix('patient')->middleware('role:patient')->group(function () {
        // Profile
        Route::get('/profile', [PatientController::class, 'profile']);
        Route::put('/profile', [PatientController::class, 'updateProfile']);
        Route::put('/password', [PatientController::class, 'updatePassword']);
        Route::get('/dashboard/stats', [PatientController::class, 'dashboardStats']);

        // Health Metrics
        Route::get('/health-metrics', [PatientController::class, 'healthMetrics']);
        
        // Recent Activity
        Route::get('/recent-activity', [PatientController::class, 'recentActivity']);
        
        // Notifications
        Route::get('/notifications', [PatientController::class, 'notifications']);
        
        // Visits
        Route::get('/visits', [PatientController::class, 'visits']);
        Route::post('/visits', [PatientController::class, 'addVisit']);
        Route::delete('/visits/{visit}', [PatientController::class, 'deleteVisit']);
        
        // Files
        Route::get('/files', [PatientController::class, 'files']);
        Route::post('/files', [PatientController::class, 'addFile']);
        Route::delete('/files/{file}', [PatientController::class, 'deleteFile']);
        
        // Notes
        Route::get('/notes', [PatientController::class, 'notes']);
        Route::post('/notes', [PatientController::class, 'addNote']);
        Route::delete('/notes/{note}', [PatientController::class, 'deleteNote']);

        // Profile Photo
        Route::post('/profile/photo', [PatientController::class, 'uploadPhoto']);
        Route::delete('/profile/photo', [PatientController::class, 'deletePhoto']);
        
        // Doctors (for patients to view)
        Route::get('/doctors', [PatientController::class, 'getDoctors']);
        Route::get('/doctors/{doctor}/services', [PatientController::class, 'getDoctorServices']);
        
        // Services
        Route::get('/services', [ServiceController::class, 'index']);
        Route::get('/services/{service}', [ServiceController::class, 'show']);
        
        // Bookings
        Route::post('/bookings', [AppointmentController::class, 'store']);
        Route::get('/my-bookings', [AppointmentController::class, 'myBookings']);
        Route::put('/my-bookings/{booking}', [AppointmentController::class, 'update']);
        Route::patch('/my-bookings/{booking}/cancel', [AppointmentController::class, 'cancel']);
        
        // Appointments lists
        Route::get('/appointments/upcoming', [AppointmentController::class, 'upcoming']);
        Route::get('/appointments/past', [AppointmentController::class, 'past']);

        // Invoices — Phase 6 ("Patient Can: View Invoice, Download
        // Invoice, View Payment History"). The list doubles as payment
        // history since each row carries status + date.
        Route::get('/invoices', [PatientController::class, 'invoices']);
        Route::get('/invoices/{invoice}', [PatientController::class, 'invoiceDetail']);
    });

    // ===== RECEPTIONIST ROUTES (Phase 5) =====
    Route::prefix('receptionist')->middleware('role:receptionist')->group(function () {
        // Profile
        Route::get('/profile', [ReceptionistController::class, 'profile']);
        Route::put('/profile', [ReceptionistController::class, 'updateProfile']);
        Route::put('/password', [ReceptionistController::class, 'updatePassword']);

        // Dashboard
        Route::get('/dashboard/stats', [ReceptionistController::class, 'dashboardStats']);

        // Patients — approval workflow, walk-ins, search, edit.
        // No delete route: receptionists cannot delete patients (roadmap).
        Route::get('/patients', [ReceptionistPatientController::class, 'index']);
        Route::get('/patients/pending', [ReceptionistPatientController::class, 'pending']);
        Route::get('/patients/search', [ReceptionistPatientController::class, 'search']);
        Route::get('/patients/{patient}', [ReceptionistPatientController::class, 'show']);
        Route::put('/patients/{patient}', [ReceptionistPatientController::class, 'update']);
        Route::patch('/patients/{patient}/approve', [ReceptionistPatientController::class, 'approve']);
        Route::patch('/patients/{patient}/reject', [ReceptionistPatientController::class, 'reject']);
        Route::post('/patients/walk-in', [ReceptionistPatientController::class, 'registerWalkIn']);

        // Appointments — create, reschedule, cancel, check-in.
        Route::post('/appointments', [ReceptionistAppointmentController::class, 'store']);
        Route::put('/appointments/{booking}/reschedule', [ReceptionistAppointmentController::class, 'reschedule']);
        Route::patch('/appointments/{booking}/cancel', [ReceptionistAppointmentController::class, 'cancel']);
        Route::patch('/appointments/{booking}/check-in', [ReceptionistAppointmentController::class, 'checkIn']);
        Route::get('/appointments/today', [ReceptionistAppointmentController::class, 'todaySchedule']);

        // Doctors — read-only availability/schedule (no delete/edit access).
        Route::get('/doctors/availability', [ReceptionistAppointmentController::class, 'doctorAvailability']);
        Route::get('/doctors/{doctor}/schedule', [ReceptionistAppointmentController::class, 'doctorSchedule']);
        Route::get('/doctors/{doctor}/services', [ReceptionistAppointmentController::class, 'doctorServices']);

        // Invoices — Phase 6. No revenue/report routes here; those are
        // Admin-only per the roadmap ("Receptionist Cannot: Access
        // Financial Reports").
        Route::get('/invoices', [ReceptionistInvoiceController::class, 'index']);
        Route::post('/invoices', [ReceptionistInvoiceController::class, 'store']);
        Route::get('/invoices/{invoice}', [ReceptionistInvoiceController::class, 'show']);
        Route::get('/invoices/{invoice}/receipt', [ReceptionistInvoiceController::class, 'receipt']);
        Route::patch('/invoices/{invoice}/mark-paid', [ReceptionistInvoiceController::class, 'markPaid']);
        Route::patch('/invoices/{invoice}/mark-pending', [ReceptionistInvoiceController::class, 'markPending']);
    });

    // ===== ADMIN ROUTES =====
    Route::prefix('admin')->middleware('role:admin')->group(function () {
        // Doctors management
        Route::get('/doctors', [AdminDoctorController::class, 'index']);
        Route::post('/doctors', [AdminDoctorController::class, 'store']);
        Route::get('/doctors/{doctor}', [AdminDoctorController::class, 'show']);
        Route::put('/doctors/{doctor}', [AdminDoctorController::class, 'update']);
        Route::delete('/doctors/{doctor}', [AdminDoctorController::class, 'destroy']);
        
        // Patients management
        Route::get('/patients', [AdminPatientController::class, 'index']);
        Route::post('/patients', [AdminPatientController::class, 'store']);
        Route::get('/patients/{patient}', [AdminPatientController::class, 'show']);
        Route::put('/patients/{patient}', [AdminPatientController::class, 'update']);
        Route::delete('/patients/{patient}', [AdminPatientController::class, 'destroy']);

        // Receptionists management (Phase 5) — admin is the only role
        // that can create/delete receptionist accounts.
        Route::get('/receptionists', [AdminReceptionistController::class, 'index']);
        Route::post('/receptionists', [AdminReceptionistController::class, 'store']);
        Route::get('/receptionists/{receptionist}', [AdminReceptionistController::class, 'show']);
        Route::put('/receptionists/{receptionist}', [AdminReceptionistController::class, 'update']);
        Route::delete('/receptionists/{receptionist}', [AdminReceptionistController::class, 'destroy']);
        
        // Appointments
        Route::get('/appointments', [AppointmentController::class, 'adminAppointments']);
        Route::get('/appointments/{booking}', [AppointmentController::class, 'show']);
        Route::patch('/appointments/{booking}/status', [AppointmentController::class, 'updateStatus']);
        Route::patch('/appointments/{booking}/cancel', [AppointmentController::class, 'cancel']);

        // Billing — Phase 6. Admin-only: revenue, financial reports,
        // outstanding payments, paid invoices.
        Route::get('/billing/summary', [AdminBillingController::class, 'summary']);
        Route::get('/billing/invoices', [AdminBillingController::class, 'invoices']);

        // Reports — Phase 7.
        Route::get('/reports/overview', [AdminReportController::class, 'index']);
    });
});
