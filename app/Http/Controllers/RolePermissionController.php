<?php

namespace App\Http\Controllers;

use App\Models\RolePermission;
use Illuminate\Http\Request;

class RolePermissionController extends Controller
{
    public function index()
    {
        return response()->json(RolePermission::all());
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'permissions' => 'required|array',
            'permissions.*.role' => 'required|string',
            'permissions.*.module' => 'required|string',
            'permissions.*.can_read' => 'required|boolean',
            'permissions.*.can_write' => 'required|boolean',
        ]);

        foreach ($validated['permissions'] as $perm) {
            RolePermission::updateOrCreate(
                [
                    'role' => $perm['role'],
                    'module' => $perm['module'],
                ],
                [
                    'can_read' => $perm['can_read'],
                    'can_write' => $perm['can_write'],
                ]
            );
        }

        return response()->json([
            'message' => 'Role permissions updated successfully',
            'permissions' => RolePermission::all()
        ]);
    }
}
