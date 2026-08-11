<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Prescription extends Model
{
    protected $fillable = [
        'patient_id', 'doctor_id', 'booking_id', 'medicine',
        'dose', 'frequency', 'duration', 'notes', 'prescribed_date',
    ];

    protected $casts = [
        'prescribed_date' => 'date',
    ];

    public function patient(): BelongsTo { return $this->belongsTo(Patient::class); }
    public function doctor(): BelongsTo { return $this->belongsTo(Doctor::class); }
    public function booking(): BelongsTo { return $this->belongsTo(Booking::class); }
}
