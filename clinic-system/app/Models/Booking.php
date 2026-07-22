<?php  
  
namespace App\Models;  
  
use Illuminate\Database\Eloquent\Model;  
use Illuminate\Database\Eloquent\Relations\BelongsTo;  
  
class Booking extends Model  
{  
    protected $fillable = [  
        'patient_id',  
        'service_id',  
        'date',  
        'time',  
        'status',  
        'notes',  
    ];  
  
    public function patient(): BelongsTo  
    {  
        return $this->belongsTo(User::class, 'patient_id');  
    }  
  
    public function service(): BelongsTo  
    {  
        return $this->belongsTo(Service::class);  
    }  
}