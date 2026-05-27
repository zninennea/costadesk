<?php

namespace App\Http\Controllers;

use App\Models\Addon;
use Illuminate\Http\Request;

class AddonController extends Controller
{
    public function index(Request $request)
    {
        // Admin might want to see inactive addons too
        if ($request->has('all')) {
            return response()->json(Addon::all());
        }
        $addons = Addon::where('is_active', true)->get();
        return response()->json($addons);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'addon_code' => 'required|string|unique:addons',
            'addon_name' => 'required|string',
            'addon_type' => 'required|string',
            'price' => 'required|numeric',
            'price_type' => 'required|string',
            'stock_quantity' => 'nullable|integer',
            'requires_approval' => 'boolean',
            'is_active' => 'boolean',
        ]);
        
        $addon = Addon::create($validated);
        return response()->json($addon, 201);
    }

    public function update(Request $request, Addon $addon)
    {
        $validated = $request->validate([
            'addon_code' => 'string|unique:addons,addon_code,' . $addon->id,
            'addon_name' => 'string',
            'addon_type' => 'string',
            'price' => 'numeric',
            'price_type' => 'string',
            'stock_quantity' => 'nullable|integer',
            'requires_approval' => 'boolean',
            'is_active' => 'boolean',
        ]);
        
        $addon->update($validated);
        return response()->json($addon);
    }

    public function destroy(Addon $addon)
    {
        $addon->delete();
        return response()->json(['message' => 'Addon deleted successfully']);
    }
}
