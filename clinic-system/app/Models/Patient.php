<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    protected $fillable = [
        'user_id',
        'gender',
        'date_of_birth',
        'blood_group',
        'address',
        'emergency_contact_name',
        'emergency_contact_phone',
        'medical_history',
        'status',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'status' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
