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

    'status'

];

public function user()
{
    return $this->belongsTo(User::class);
}

public function specialization()
{
    return $this->belongsTo(Specialization::class);
}
}
