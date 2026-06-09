<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GuestViolation extends Model
{
    protected $guarded = [];

    protected $fillable = [
        'booking_id',
        'guest_name',
        'room_number',
        'violation_type',
        'description',
        'action_taken',
        'reported_by'
    ];

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}