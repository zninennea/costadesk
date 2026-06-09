<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Booking extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function guest()
    {
        return $this->belongsTo(Guest::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function checkin()
    {
        return $this->hasOne(Checkin::class);
    }

    public function checkout()
    {
        return $this->hasOne(Checkout::class);
    }

    public function bill()
    {
        return $this->hasOne(Bill::class);
    }
}