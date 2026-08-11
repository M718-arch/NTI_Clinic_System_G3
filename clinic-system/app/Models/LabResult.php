<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class LabResult extends Model
{
    protected $fillable = [
        'patient_id', 'doctor_id', 'booking_id', 'test_name', 'result',
        'unit', 'reference_range', 'result_date', 'file_path', 'notes',
    ];

    protected $casts = [
        'result_date' => 'date',
    ];

    public function patient(): BelongsTo { return $this->belongsTo(Patient::class); }
    public function doctor(): BelongsTo { return $this->belongsTo(Doctor::class); }
    public function booking(): BelongsTo { return $this->belongsTo(Booking::class); }

    public function getFileUrlAttribute()
    {
        if ($this->file_path && Storage::disk('public')->exists($this->file_path)) {
            return asset('storage/' . $this->file_path);
        }
        return null;
    }
}
