<?php
// app/Http/Controllers/Api/EmrController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Diagnosis;
use App\Models\LabResult;
use App\Models\RadiologyResult;
use App\Models\Prescription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EmrController extends Controller
{
    /**
     * Get full EMR for a patient
     */
    public function show(Patient $patient)
    {
        try {
            $patient->load([
                'user',
                'diagnoses' => function ($query) {
                    $query->with('doctor.user')->orderBy('diagnosed_date', 'desc');
                },
                'labResults' => function ($query) {
                    $query->with('doctor.user')->orderBy('result_date', 'desc');
                },
                'radiologyResults' => function ($query) {
                    $query->with('doctor.user')->orderBy('result_date', 'desc');
                },
                'prescriptions' => function ($query) {
                    $query->with('doctor.user')->orderBy('prescribed_date', 'desc');
                }
            ]);

            return response()->json([
                'patient' => [
                    'id' => $patient->id,
                    'user' => $patient->user,
                    'name' => $patient->user?->name,
                    'email' => $patient->user?->email,
                ],
                'diagnoses' => $patient->getRelation('diagnoses')->map(function($diagnosis) {
                    return [
                        'id' => $diagnosis->id,
                        'title' => $diagnosis->title,
                        'condition' => $diagnosis->title, // For backward compatibility
                        'icd_code' => $diagnosis->icd_code,
                        'description' => $diagnosis->description,
                        'notes' => $diagnosis->description, // For backward compatibility
                        'diagnosed_date' => $diagnosis->diagnosed_date?->format('Y-m-d'),
                        'diagnosed_at' => $diagnosis->diagnosed_date?->format('Y-m-d'), // For backward compatibility
                        'doctor_name' => $diagnosis->doctor?->user?->name,
                        'created_at' => $diagnosis->created_at,
                    ];
                }),
                'lab_results' => $patient->labResults->map(function($lab) {
                    return [
                        'id' => $lab->id,
                        'test_name' => $lab->test_name,
                        'result' => $lab->result,
                        'unit' => $lab->unit,
                        'reference_range' => $lab->reference_range,
                        'interpretation' => $lab->interpretation,
                        'result_date' => $lab->result_date?->format('Y-m-d'),
                        'performed_at' => $lab->result_date?->format('Y-m-d'), // For backward compatibility
                        'notes' => $lab->notes,
                        'file_url' => $lab->file_url,
                        'doctor_name' => $lab->doctor?->user?->name,
                    ];
                }),
                'radiology_results' => $patient->radiologyResults->map(function($radiology) {
                    return [
                        'id' => $radiology->id,
                        'imaging_type' => $radiology->imaging_type,
                        'study_type' => $radiology->imaging_type, // For backward compatibility
                        'body_area' => $radiology->body_area,
                        'findings' => $radiology->findings,
                        'impression' => $radiology->impression,
                        'result_date' => $radiology->result_date?->format('Y-m-d'),
                        'performed_at' => $radiology->result_date?->format('Y-m-d'), // For backward compatibility
                        'notes' => $radiology->notes,
                        'file_url' => $radiology->file_url,
                        'doctor_name' => $radiology->doctor?->user?->name,
                    ];
                }),
                'prescriptions' => $patient->prescriptions->map(function($prescription) {
                    return [
                        'id' => $prescription->id,
                        'medicine' => $prescription->medicine,
                        'dose' => $prescription->dose,
                        'frequency' => $prescription->frequency,
                        'duration' => $prescription->duration,
                        'notes' => $prescription->notes,
                        'prescribed_date' => $prescription->prescribed_date?->format('Y-m-d'),
                        'doctor_name' => $prescription->doctor?->user?->name,
                    ];
                }),
            ]);

        } catch (\Exception $e) {
            Log::error('EMR show error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching patient chart: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a new diagnosis
     */
    public function storeDiagnosis(Request $request, Patient $patient)
    {
        try {
            $doctor = $request->user()->doctor;

            if (!$doctor) {
                return response()->json(['message' => 'Doctor profile not found'], 404);
            }

            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'condition' => 'sometimes|string|max:255',
                'icd_code' => 'nullable|string|max:20',
                'description' => 'nullable|string|max:1000',
                'notes' => 'nullable|string|max:1000',
                'diagnosed_date' => 'nullable|date',
                'diagnosed_at' => 'nullable|date',
                'booking_id' => 'nullable|exists:bookings,id',
            ]);

            // Use title or condition (fallback)
            $title = $validated['title'] ?? $validated['condition'] ?? null;
            
            if (!$title) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => ['title' => ['The title field is required.'], 'condition' => ['The condition field is required.']]
                ], 422);
            }

            $diagnosis = Diagnosis::create([
                'patient_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'title' => $title,
                'icd_code' => $validated['icd_code'] ?? null,
                'description' => $validated['description'] ?? $validated['notes'] ?? null,
                'diagnosed_date' => $validated['diagnosed_date'] ?? $validated['diagnosed_at'] ?? now(),
                'booking_id' => $validated['booking_id'] ?? null,
            ]);

            return response()->json([
                'message' => 'Diagnosis added successfully',
                'data' => $diagnosis
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Store diagnosis error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error adding diagnosis: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a new lab result
     */
    public function storeLabResult(Request $request, Patient $patient)
    {
        try {
            $doctor = $request->user()->doctor;

            if (!$doctor) {
                return response()->json(['message' => 'Doctor profile not found'], 404);
            }

            $validated = $request->validate([
                'test_name' => 'required|string|max:255',
                'result' => 'nullable|string|max:500',
                'unit' => 'nullable|string|max:50',
                'reference_range' => 'nullable|string|max:100',
                'interpretation' => 'nullable|string|max:500',
                'result_date' => 'nullable|date',
                'performed_at' => 'nullable|date',
                'notes' => 'nullable|string|max:1000',
                'booking_id' => 'nullable|exists:bookings,id',
            ]);

            $labResult = LabResult::create([
                'patient_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'test_name' => $validated['test_name'],
                'result' => $validated['result'] ?? null,
                'unit' => $validated['unit'] ?? null,
                'reference_range' => $validated['reference_range'] ?? null,
                'interpretation' => $validated['interpretation'] ?? null,
                'result_date' => $validated['result_date'] ?? $validated['performed_at'] ?? now(),
                'notes' => $validated['notes'] ?? null,
                'booking_id' => $validated['booking_id'] ?? null,
            ]);

            return response()->json([
                'message' => 'Lab result added successfully',
                'data' => $labResult
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Store lab result error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error adding lab result: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a new radiology result
     */
    public function storeRadiologyResult(Request $request, Patient $patient)
    {
        try {
            $doctor = $request->user()->doctor;

            if (!$doctor) {
                return response()->json(['message' => 'Doctor profile not found'], 404);
            }

            $validated = $request->validate([
                'imaging_type' => 'sometimes|string|max:255',
                'study_type' => 'sometimes|string|max:255',
                'body_area' => 'nullable|string|max:255',
                'findings' => 'nullable|string|max:1000',
                'impression' => 'nullable|string|max:1000',
                'result_date' => 'nullable|date',
                'performed_at' => 'nullable|date',
                'notes' => 'nullable|string|max:1000',
                'booking_id' => 'nullable|exists:bookings,id',
            ]);

            // Use imaging_type or study_type
            $imagingType = $validated['imaging_type'] ?? $validated['study_type'] ?? null;
            
            if (!$imagingType) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => ['imaging_type' => ['The imaging type field is required.'], 'study_type' => ['The study type field is required.']]
                ], 422);
            }

            $radiologyResult = RadiologyResult::create([
                'patient_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'imaging_type' => $imagingType,
                'body_area' => $validated['body_area'] ?? null,
                'findings' => $validated['findings'] ?? null,
                'impression' => $validated['impression'] ?? null,
                'result_date' => $validated['result_date'] ?? $validated['performed_at'] ?? now(),
                'notes' => $validated['notes'] ?? null,
                'booking_id' => $validated['booking_id'] ?? null,
            ]);

            return response()->json([
                'message' => 'Radiology result added successfully',
                'data' => $radiologyResult
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Store radiology result error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error adding radiology result: ' . $e->getMessage(),
            ], 500);
        }
    }
}