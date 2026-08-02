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
        'photo',  // ← MUST BE HERE
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'status' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'patient_id');
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
}