<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class Specialization extends Model
{
    use HasFactory;
    protected $fillable = [

    'name',

    'description',

    'status'

];

public function doctors()
{
    return $this->hasMany(Doctor::class);
}
}
