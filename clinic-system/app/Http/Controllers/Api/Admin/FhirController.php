<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Booking;

/**
 * HL7 FHIR export (Phase 8, "Bonus" per the roadmap).
 *
 * Produces minimal-but-valid FHIR R4 resources (Patient, Practitioner,
 * Appointment) — enough structure to be a real starting point for
 * interop with an EHR, not a claim of full FHIR conformance. Notably
 * absent: no FHIR server (search, _history, Bundle endpoints), no
 * OAuth2/SMART-on-FHIR auth layer, no CapabilityStatement. This is a
 * data *export* in FHIR's JSON shape, which is what the roadmap
 * actually asks for ("Export Patient, Doctor, Appointment as FHIR
 * JSON"), not a certified FHIR API.
 */
class FhirController extends Controller
{
    public function patient(Patient $patient)
    {
        $patient->load('user');

        return response()->json([
            'resourceType' => 'Patient',
            'id' => (string) $patient->id,
            'active' => (bool) $patient->status,
            'name' => [[
                'use' => 'official',
                'text' => $patient->user->name ?? null,
            ]],
            'telecom' => array_values(array_filter([
                $patient->user->email ? ['system' => 'email', 'value' => $patient->user->email] : null,
                $patient->phone ? ['system' => 'phone', 'value' => $patient->phone] : null,
            ])),
            'gender' => $patient->gender,
            'birthDate' => $patient->date_of_birth?->format('Y-m-d'),
            'address' => $patient->address ? [['text' => $patient->address]] : [],
            'extension' => array_values(array_filter([
                $patient->blood_group ? [
                    'url' => 'https://mediglass.example/fhir/StructureDefinition/blood-group',
                    'valueString' => $patient->blood_group,
                ] : null,
                $patient->allergies && $patient->allergies !== 'None' ? [
                    'url' => 'https://mediglass.example/fhir/StructureDefinition/allergies',
                    'valueString' => $patient->allergies,
                ] : null,
            ])),
        ]);
    }

    public function doctor(Doctor $doctor)
    {
        $doctor->load(['user', 'specialization']);

        return response()->json([
            'resourceType' => 'Practitioner',
            'id' => (string) $doctor->id,
            'active' => (bool) $doctor->status,
            'name' => [[
                'use' => 'official',
                'text' => $doctor->full_name ?: ($doctor->user->name ?? null),
                'prefix' => ['Dr.'],
            ]],
            'telecom' => array_values(array_filter([
                $doctor->user->email ? ['system' => 'email', 'value' => $doctor->user->email] : null,
                $doctor->phone ? ['system' => 'phone', 'value' => $doctor->phone] : null,
            ])),
            'gender' => $doctor->gender,
            'birthDate' => $doctor->date_of_birth?->format('Y-m-d'),
            'qualification' => $doctor->specialization ? [[
                'code' => ['text' => $doctor->specialization->name],
            ]] : [],
        ]);
    }

    public function appointment(Booking $booking)
    {
        $booking->load(['patient.user', 'service.doctor.user']);

        return response()->json([
            'resourceType' => 'Appointment',
            'id' => (string) $booking->id,
            'status' => $this->mapStatus($booking->status),
            'serviceType' => $booking->service ? [[
                'text' => $booking->service->name,
            ]] : [],
            'description' => $booking->notes,
            'start' => $this->toIso8601($booking->date, $booking->time),
            'end' => $this->toIso8601($booking->date, $booking->time, $booking->service->duration ?? 30),
            'participant' => array_values(array_filter([
                $booking->patient ? [
                    'actor' => [
                        'reference' => "Patient/{$booking->patient_id}",
                        'display' => $booking->patient->user->name ?? null,
                    ],
                    'status' => 'accepted',
                ] : null,
                $booking->service?->doctor_id ? [
                    'actor' => [
                        'reference' => "Practitioner/{$booking->service->doctor_id}",
                        'display' => $booking->service->doctor->full_name ?? ($booking->service->doctor->user->name ?? null),
                    ],
                    'status' => 'accepted',
                ] : null,
            ])),
        ]);
    }

    private function mapStatus(string $status): string
    {
        // Internal status -> FHIR Appointment.status value set.
        return match ($status) {
            'pending' => 'proposed',
            'confirmed' => 'booked',
            'completed' => 'fulfilled',
            'cancelled' => 'cancelled',
            default => 'proposed',
        };
    }

    private function toIso8601(string $date, string $time, int $addMinutes = 0): string
    {
        $dt = \Carbon\Carbon::parse("{$date} {$time}");
        if ($addMinutes) {
            $dt = $dt->copy()->addMinutes($addMinutes);
        }
        return $dt->toIso8601String();
    }
}
