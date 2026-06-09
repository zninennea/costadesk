<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bill extends Model
{
    protected $guarded = [];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function checkin()
    {
        return $this->belongsTo(Checkin::class);
    }

    public function guest()
    {
        return $this->belongsTo(Guest::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function billItems()
    {
        return $this->hasMany(BillItem::class);
    }

    public function billDiscounts()
    {
        return $this->hasMany(BillDiscount::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}