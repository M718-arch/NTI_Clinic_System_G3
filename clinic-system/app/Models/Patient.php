<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Patient extends Model
{
    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'gender',
        'date_of_birth',
        'blood_group',
        'address',
        'emergency_contact_name',
        'emergency_contact_phone',
        'allergies',
        'chronic_diseases',
        'current_medications',
        'lifestyle_habits',
        'medical_history',
        'diagnoses',
        'family_history',
        'past_surgeries',
        'status',
        'photo',
        // Phase 5 — patient registration/approval workflow
        'approval_status',
        'approved_by',
        'approved_at',
        'rejection_reason',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'status' => 'boolean',
        'approved_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'patient_id');
    }

    /**
     * Phase 8 EMR relationships. These were missing entirely — Diagnosis/
     * LabResult/RadiologyResult/Prescription all had `belongsTo(Patient)`
     * defined, but Patient never had the inverse `hasMany`. Any code
     * calling `$patient->diagnoses`, `$patient->load('diagnoses')`, or
     * `$patient->diagnoses()->create(...)` was throwing
     * "Call to undefined relationship" — this is that fix.
     *
     * NOTE: `diagnoses()` (the relationship, plural, callable) is a
     * different thing from the `diagnoses` *column* already in
     * $fillable above — that's a legacy free-text field from before
     * Phase 8's structured Diagnosis model existed. Eloquent lets both
     * coexist (attribute access `$patient->diagnoses` on a loaded model
     * returns the column value unless the relationship has been
     * eager-loaded/queried, in which case the relationship takes
     * precedence for `$patient->diagnoses` after `load()`/`with()`).
     * If you're seeing unexpected values from `$patient->diagnoses`
     * elsewhere in the app (outside the EMR feature), this naming
     * collision is why — consider renaming one of the two.
     */
    public function diagnoses()
    {
        return $this->hasMany(Diagnosis::class);
    }

    public function labResults()
    {
        return $this->hasMany(LabResult::class);
    }

    public function radiologyResults()
    {
        return $this->hasMany(RadiologyResult::class);
    }

    public function prescriptions()
    {
        return $this->hasMany(Prescription::class);
    }

    public function getFullNameAttribute()
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    public function getPhotoUrlAttribute()
    {
        if ($this->photo && Storage::disk('public')->exists($this->photo)) {
            return asset('storage/' . $this->photo);
        }
        return null;
    }

    public function isApproved(): bool
    {
        return $this->approval_status === 'approved';
    }

    public function scopePending($query)
    {
        return $query->where('approval_status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('approval_status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('approval_status', 'rejected');
    }
}