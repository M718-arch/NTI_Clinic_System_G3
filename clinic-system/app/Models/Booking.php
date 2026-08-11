<?php
// app/Models/Booking.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    protected $fillable = [
        'patient_id',
        'doctor_id',
        'service_id',
        'date',
        'time',
        'appointment_date',
        'appointment_time',
        'status',
        'notes',
        'checked_in_at',
        // Phase 8: Queue Management fields
        'queue_status',  // waiting, in_consult, done
        'room',          // Room number/name
        'called_at',     // When the patient was called
    ];

    protected $casts = [
        'checked_in_at' => 'datetime',
        'called_at' => 'datetime',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    // Phase 8: Queue Management helper methods
    
    /**
     * Check if the booking is in the queue
     */
    public function isInQueue(): bool
    {
        return in_array($this->queue_status, ['waiting', 'in_consult']);
    }

    /**
     * Check if the booking is waiting
     */
    public function isWaiting(): bool
    {
        return $this->queue_status === 'waiting';
    }

    /**
     * Check if the booking is in consultation
     */
    public function isInConsult(): bool
    {
        return $this->queue_status === 'in_consult';
    }

    /**
     * Check if the booking is done
     */
    public function isDone(): bool
    {
        return $this->queue_status === 'done';
    }

    /**
     * Mark the booking as waiting (called when patient checks in)
     */
    public function markAsWaiting(): self
    {
        $this->update([
            'queue_status' => 'waiting',
            'checked_in_at' => $this->checked_in_at ?? now(),
        ]);
        return $this;
    }

    /**
     * Mark the booking as in consultation (called by doctor)
     */
    public function markAsInConsult(?string $room = null): self
    {
        $this->update([
            'queue_status' => 'in_consult',
            'room' => $room ?? $this->room,
            'called_at' => now(),
        ]);
        return $this;
    }

    /**
     * Mark the booking as done (completed)
     */
    public function markAsDone(): self
    {
        $this->update([
            'queue_status' => 'done',
            'status' => 'completed',
        ]);
        return $this;
    }

    /**
     * Clear queue status (used when cancelling)
     */
    public function clearQueueStatus(): self
    {
        $this->update([
            'queue_status' => null,
            'room' => null,
            'called_at' => null,
        ]);
        return $this;
    }
}