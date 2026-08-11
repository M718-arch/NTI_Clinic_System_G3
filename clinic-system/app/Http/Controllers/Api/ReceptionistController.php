<?php
// app/Http/Controllers/Api/ReceptionistController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Receptionist;
use App\Models\Patient;
use App\Models\Booking;
use App\Models\Doctor;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class ReceptionistController extends Controller
{
    /**
     * Get receptionist profile
     */
    public function profile(Request $request)
    {
        try {
            $user = $request->user();
            
            // Try to find receptionist profile
            $receptionist = Receptionist::where('user_id', $user->id)->first();
            
            return response()->json([
                'id' => $receptionist->id ?? null,
                'user_id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? ($receptionist->phone ?? null),
                'role' => $user->role,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Receptionist profile error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Receptionist profile not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update receptionist profile
     */
    public function updateProfile(Request $request)
    {
        try {
            $user = $request->user();
            $receptionist = Receptionist::where('user_id', $user->id)->first();

            $validator = Validator::make($request->all(), [
                'name' => 'nullable|string|max:255',
                'email' => 'nullable|email|unique:users,email,' . $user->id,
                'phone' => 'nullable|string|max:20',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Update user
            if ($request->has('name')) {
                $user->name = $request->name;
            }
            if ($request->has('email')) {
                $user->email = $request->email;
            }
            if ($request->has('phone')) {
                $user->phone = $request->phone;
            }
            $user->save();

            // Update or create receptionist profile
            if ($receptionist) {
                if ($request->has('phone')) {
                    $receptionist->phone = $request->phone;
                    $receptionist->save();
                }
            } else {
                // Create receptionist profile if it doesn't exist
                $receptionist = Receptionist::create([
                    'user_id' => $user->id,
                    'phone' => $request->phone ?? $user->phone,
                    'status' => true,
                ]);
            }

            return response()->json([
                'message' => 'Profile updated successfully',
                'data' => [
                    'id' => $receptionist->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Receptionist profile update error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error updating profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update receptionist password
     */
    public function updatePassword(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:8|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = $request->user();

            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'message' => 'Current password is incorrect'
                ], 400);
            }

            $user->update([
                'password' => Hash::make($request->new_password),
            ]);

            return response()->json([
                'message' => 'Password updated successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Receptionist password update error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error updating password',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get dashboard statistics for receptionist
     */
    public function dashboardStats(Request $request)
    {
        try {
            $today = now()->toDateString();
            
            // Check which columns exist in the bookings table
            $bookingColumns = \Schema::getColumnListing('bookings');
            $dateColumn = in_array('date', $bookingColumns) ? 'date' : 
                         (in_array('appointment_date', $bookingColumns) ? 'appointment_date' : 'date');
            
            // Patient stats - check if approval_status column exists
            $patientColumns = \Schema::getColumnListing('patients');
            $hasApprovalStatus = in_array('approval_status', $patientColumns);
            $hasStatus = in_array('status', $patientColumns);
            
            $pendingPatients = 0;
            if ($hasApprovalStatus) {
                $pendingPatients = Patient::where('approval_status', 'pending')->count();
            } elseif ($hasStatus) {
                $pendingPatients = Patient::where('status', 'pending')->count();
            }
            
            $totalPatients = Patient::count();
            
            // Today's appointments
            $todayAppointments = Booking::whereDate($dateColumn, $today)->count();
            
            // Doctor availability
            $doctors = Doctor::with('user')
                ->get()
                ->map(function ($doctor) {
                    return [
                        'id' => $doctor->id,
                        'name' => $doctor->user->name ?? ($doctor->first_name . ' ' . $doctor->last_name),
                        'available' => $doctor->status ?? true,
                    ];
                });
            
            // Check if invoices table exists and has correct columns
            $pendingInvoices = 0;
            $outstandingAmount = 0;
            $todayRevenue = 0;
            $invoiceAvailable = \Schema::hasTable('invoices');
            
            if ($invoiceAvailable) {
                $invoiceColumns = \Schema::getColumnListing('invoices');
                $hasStatus = in_array('status', $invoiceColumns);
                $hasAmount = in_array('amount', $invoiceColumns);
                
                if ($hasStatus) {
                    $pendingInvoices = Invoice::where('status', 'pending')->count();
                    
                    if ($hasAmount) {
                        $outstandingAmount = Invoice::where('status', 'pending')->sum('amount');
                    }
                }
                
                // Check for paid_at or updated_at for today's revenue
                $paidColumn = in_array('paid_at', $invoiceColumns) ? 'paid_at' : 
                             (in_array('updated_at', $invoiceColumns) ? 'updated_at' : null);
                
                if ($paidColumn && $hasStatus && $hasAmount) {
                    $todayRevenue = Invoice::where('status', 'paid')
                        ->whereDate($paidColumn, $today)
                        ->sum('amount');
                }
            }
            
            return response()->json([
                'pending_patient_registrations' => $pendingPatients,
                'total_patients' => $totalPatients,
                'todays_appointments' => $todayAppointments,
                'doctor_availability' => $doctors,
                'pending_invoices' => $pendingInvoices,
                'outstanding_amount' => $outstandingAmount,
                'formatted_outstanding_amount' => '$' . number_format($outstandingAmount, 2),
                'today_revenue' => $todayRevenue,
                'formatted_today_revenue' => '$' . number_format($todayRevenue, 2),
                'billing_summary' => [
                    'available' => $invoiceAvailable,
                    'pending_count' => $pendingInvoices,
                    'outstanding_amount' => $outstandingAmount,
                    'formatted_outstanding' => '$' . number_format($outstandingAmount, 2),
                ],
            ]);
            
        } catch (\Exception $e) {
            Log::error('Receptionist dashboard stats error: ' . $e->getMessage());
            Log::error('Error trace: ' . $e->getTraceAsString());
            
            // Return fallback data
            return response()->json([
                'pending_patient_registrations' => 0,
                'total_patients' => 0,
                'todays_appointments' => 0,
                'doctor_availability' => [],
                'pending_invoices' => 0,
                'outstanding_amount' => 0,
                'formatted_outstanding_amount' => '$0.00',
                'today_revenue' => 0,
                'formatted_today_revenue' => '$0.00',
                'billing_summary' => [
                    'available' => false,
                    'message' => 'Billing data temporarily unavailable',
                ],
            ]);
        }
    }
}