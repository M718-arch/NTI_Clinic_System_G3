<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Doctor extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'user_id',
        'specialization_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'gender',
        'date_of_birth',
        'experience_years',
        'consultation_fee',
        'address',
        'bio',
        'image',
        'status',
        'clinic_name',
        'branch',
        'operating_hours',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'experience_years' => 'integer',
        'consultation_fee' => 'decimal:2',
        'status' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function specialization()
    {
        return $this->belongsTo(Specialization::class);
    }

    // ADD THIS RELATIONSHIP
    public function appointments()
    {
        return $this->hasMany(Booking::class, 'doctor_id');
    }

    public function services()
    {
        return $this->hasMany(Service::class);
    }

    public function getFullNameAttribute()
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    public function getImageUrlAttribute()
    {
        if ($this->image) {
            return asset('storage/' . $this->image);
        }
        return null;
    }

    public function scopeActive($query)
    {
        return $query->where('status', true);
    }
}