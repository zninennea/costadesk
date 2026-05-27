<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Room;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function dashboardStats(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        // Base query for payments
        $paymentQuery = Payment::where('status', 'completed');
        if ($startDate && $endDate) {
            $paymentQuery->whereBetween('created_at', [$startDate, $endDate . ' 23:59:59']);
        }
        $filteredRevenue = $paymentQuery->sum('amount_paid');

        // Always calculate today and monthly for the specific widgets, regardless of filter
        $todayRevenue = Payment::where('status', 'completed')
            ->whereDate('created_at', now()->toDateString())
            ->sum('amount_paid');

        $monthlyRevenue = Payment::where('status', 'completed')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('amount_paid');

        $totalRevenue = Payment::where('status', 'completed')->sum('amount_paid');
        
        // Base query for Users
        $userQuery = User::query();
        if ($startDate && $endDate) {
            $userQuery->whereBetween('created_at', [$startDate, $endDate . ' 23:59:59']);
        }
        $totalUsers = $userQuery->count();
        $totalGuests = (clone $userQuery)->where('role', 'guest')->count();

        // Base query for Bookings
        $bookingQuery = Booking::query();
        if ($startDate && $endDate) {
            $bookingQuery->whereBetween('created_at', [$startDate, $endDate . ' 23:59:59']);
        }
        $totalBookings = $bookingQuery->count();

        $totalRooms = Room::count();
        $occupiedRooms = Room::where('status', 'occupied')->count();
        $occupancyRate = $totalRooms > 0 ? round(($occupiedRooms / $totalRooms) * 100, 2) : 0;

        $pendingApprovals = Booking::where('status', 'cancellation_requested')->count();
        $todayCheckIns = Booking::whereDate('check_in', now()->toDateString())->count();
        $todayCheckOuts = Booking::whereDate('check_out', now()->toDateString())->count();

        return response()->json([
            'today_revenue' => $todayRevenue,
            'monthly_revenue' => $monthlyRevenue,
            'total_revenue' => $totalRevenue,
            'filtered_revenue' => $filteredRevenue, // Added for date filters
            'occupancy_rate' => $occupancyRate,
            'occupied_rooms' => $occupiedRooms,
            'available_rooms' => $totalRooms - $occupiedRooms,
            'total_rooms' => $totalRooms,
            'total_users' => $totalUsers,
            'total_guests' => $totalGuests,
            'total_bookings' => $totalBookings, // Added for reservations widget
            'pending_approvals' => $pendingApprovals,
            'today_check_ins' => $todayCheckIns,
            'today_check_outs' => $todayCheckOuts,
        ]);
    }
    public function activityLogs()
    {
        $logs = \App\Models\ActivityLog::with('user')->orderBy('created_at', 'desc')->take(50)->get();
        return response()->json($logs);
    }
    public function logActivity(Request $request)
    {
        $validated = $request->validate([
            'description' => 'required|string',
            'action' => 'nullable|string',
        ]);

        $log = \App\Models\ActivityLog::create([
            'user_id' => auth('sanctum')->id(),
            'action' => $validated['action'] ?? 'system_action',
            'description' => $validated['description'],
        ]);

        return response()->json($log, 201);
    }
}
