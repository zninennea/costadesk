<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Room extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'room_number',
        'name',
        'price',
        'capacity',
        'min_heads',
        'room_category_id',
        'status',
        'image_url',
    ];

    public function category()
    {
        return $this->belongsTo(RoomCategory::class, 'room_category_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}


