<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Storage;

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

    protected $appends = [
        'full_name',
        'image_url',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function specialization()
    {
        return $this->belongsTo(Specialization::class);
    }

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
        if ($this->image && Storage::disk('public')->exists($this->image)) {
            // Force the URL to include port 8000
            $appUrl = config('app.url');
            
            // If the URL is localhost without port, add :8000
            if (str_contains($appUrl, 'localhost') && !str_contains($appUrl, ':')) {
                $appUrl = 'http://localhost:8000';
            }
            
            // Ensure trailing slash
            if (!str_ends_with($appUrl, '/')) {
                $appUrl .= '/';
            }
            
            return $appUrl . 'storage/' . $this->image;
        }
        return null;
    }

    public function scopeActive($query)
    {
        return $query->where('status', true);
    }
}