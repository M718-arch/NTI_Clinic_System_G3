<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $fillable = ['doctor_id', 'name', 'description'];

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}