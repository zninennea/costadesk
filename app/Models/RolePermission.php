<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RolePermission extends Model
{
    protected $fillable = [
        'role',
        'module',
        'can_read',
        'can_write',
    ];

    protected $casts = [
        'can_read' => 'boolean',
        'can_write' => 'boolean',
    ];
}
