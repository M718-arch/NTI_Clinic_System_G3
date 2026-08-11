<?php

namespace App\Http\Controllers\Api\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Diagnosis;
use App\Models\LabResult;
use App\Models\RadiologyResult;
use App\Models\Prescription;
use Illuminate\Http\Request;

/**
 * EMR (Phase 8). Deliberately not a general "upload any file" endpoint —
 * `file_path` on LabResult/RadiologyResult exists in the schema for
 * attaching a scanned report, but no upload route is wired here since
 * that needs storage/validation decisions (max size, allowed types) this
 * phase didn't get direction on. Add a Storage::disk('public')->store()
 * call the same way DoctorController::uploadImage does, if/when needed.
 */
class EmrController extends Controller
{
    /**
     * A patient's full chart: diagnoses, lab results, radiology,
     * prescriptions — everything the roadmap's EMR section lists except
     * Visits (that's just the patient's bookings, already available via
     * existing endpoints) and Allergies/Chronic Diseases (already plain
     * text fields on Patient from earlier phases).
     */
    public function show(Patient $patient)
    {
        return response()->json([
            'patient' => $patient->load('user'),
            'diagnoses' => Diagnosis::where('patient_id', $patient->id)
                ->with('doctor.user')
                ->orderBy('diagnosed_date', 'desc')->get(),
            'lab_results' => LabResult::where('patient_id', $patient->id)
                ->orderBy('result_date', 'desc')->get(),
            'radiology_results' => RadiologyResult::where('patient_id', $patient->id)
                ->orderBy('result_date', 'desc')->get(),
            'prescriptions' => Prescription::where('patient_id', $patient->id)
                ->orderBy('prescribed_date', 'desc')->get(),
        ]);
    }

    public function storeDiagnosis(Request $request, Patient $patient)
    {
        $doctor = $request->user()->doctor;
        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 404);
        }

        $validated = $request->validate([
            'booking_id' => 'nullable|exists:bookings,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'diagnosed_date' => 'nullable|date',
        ]);

        $diagnosis = Diagnosis::create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'booking_id' => $validated['booking_id'] ?? null,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'diagnosed_date' => $validated['diagnosed_date'] ?? now()->toDateString(),
        ]);

        return response()->json(['message' => 'Diagnosis recorded', 'data' => $diagnosis], 201);
    }

    public function storeLabResult(Request $request, Patient $patient)
    {
        $doctor = $request->user()->doctor;

        $validated = $request->validate([
            'booking_id' => 'nullable|exists:bookings,id',
            'test_name' => 'required|string|max:255',
            'result' => 'nullable|string|max:255',
            'unit' => 'nullable|string|max:50',
            'reference_range' => 'nullable|string|max:100',
            'result_date' => 'nullable|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        $labResult = LabResult::create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor?->id,
            'booking_id' => $validated['booking_id'] ?? null,
            'test_name' => $validated['test_name'],
            'result' => $validated['result'] ?? null,
            'unit' => $validated['unit'] ?? null,
            'reference_range' => $validated['reference_range'] ?? null,
            'result_date' => $validated['result_date'] ?? now()->toDateString(),
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json(['message' => 'Lab result recorded', 'data' => $labResult], 201);
    }

    public function storeRadiologyResult(Request $request, Patient $patient)
    {
        $doctor = $request->user()->doctor;

        $validated = $request->validate([
            'booking_id' => 'nullable|exists:bookings,id',
            'imaging_type' => 'required|string|max:100',
            'body_area' => 'nullable|string|max:100',
            'findings' => 'nullable|string|max:2000',
            'result_date' => 'nullable|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        $radiologyResult = RadiologyResult::create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor?->id,
            'booking_id' => $validated['booking_id'] ?? null,
            'imaging_type' => $validated['imaging_type'],
            'body_area' => $validated['body_area'] ?? null,
            'findings' => $validated['findings'] ?? null,
            'result_date' => $validated['result_date'] ?? now()->toDateString(),
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json(['message' => 'Radiology result recorded', 'data' => $radiologyResult], 201);
    }
}
