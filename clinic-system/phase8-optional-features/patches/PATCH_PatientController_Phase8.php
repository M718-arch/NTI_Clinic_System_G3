<?php

/**
 * PATCH — add to the existing app/Http/Controllers/Api/PatientController.php
 * (in addition to the Phase 6 patch already applied there — invoices()
 * and invoiceDetail())
 *
 * Note: PatientController::notifications() (built in Phase 5) needs NO
 * changes — it already queries the Notification table generically, so
 * the new notification types added in Phase 8 (appointment_booked,
 * appointment_approved, appointment_cancelled, new_message,
 * prescription_ready) show up automatically.
 *
 * Also add the routes (see api.php patch), inside the existing `patient`
 * route group:
 *   Route::get('/emr', [PatientController::class, 'emr']);
 *   Route::get('/prescriptions', [PatientController::class, 'prescriptions']);
 *   Route::get('/prescriptions/{prescription}', [PatientController::class, 'prescriptionDetail']);
 */

use App\Models\Diagnosis;
use App\Models\LabResult;
use App\Models\RadiologyResult;
use App\Models\Prescription;

// ... inside class PatientController ...

/**
 * The patient's own EMR — diagnoses, lab results, radiology,
 * prescriptions. Read-only; only doctors can create these records
 * (see Api\Doctor\EmrController / PrescriptionController).
 */
public function emr(Request $request)
{
    $patient = Patient::where('user_id', Auth::id())->first();

    if (!$patient) {
        return response()->json(['message' => 'Patient profile not found'], 404);
    }

    return response()->json([
        'diagnoses' => Diagnosis::where('patient_id', $patient->id)
            ->with('doctor.user')->orderBy('diagnosed_date', 'desc')->get(),
        'lab_results' => LabResult::where('patient_id', $patient->id)
            ->orderBy('result_date', 'desc')->get(),
        'radiology_results' => RadiologyResult::where('patient_id', $patient->id)
            ->orderBy('result_date', 'desc')->get(),
        'prescriptions' => Prescription::where('patient_id', $patient->id)
            ->with('doctor.user')->orderBy('prescribed_date', 'desc')->get(),
    ]);
}

/**
 * Prescription list — "Patient downloads PDF" per the roadmap is
 * handled the same way as invoice receipts (Phase 6): structured JSON
 * for a printable view + window.print(), not a server-rendered PDF, since
 * no PDF library is confirmed installed.
 */
public function prescriptions(Request $request)
{
    $patient = Patient::where('user_id', Auth::id())->first();

    if (!$patient) {
        return response()->json([]);
    }

    return response()->json(
        Prescription::where('patient_id', $patient->id)
            ->with('doctor.user')
            ->orderBy('prescribed_date', 'desc')
            ->get()
    );
}

public function prescriptionDetail(Request $request, Prescription $prescription)
{
    $patient = Patient::where('user_id', Auth::id())->first();

    if (!$patient || $prescription->patient_id !== $patient->id) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    return response()->json($prescription->load('doctor.user'));
}
