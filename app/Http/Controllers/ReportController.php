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
    public function getRealDashboardStats(Request $request)
{
    // Get date range from request or default to today
    $startDate = $request->query('start_date', now()->startOfMonth()->toDateString());
    $endDate = $request->query('end_date', now()->toDateString());

    // Today's revenue
    $todayRevenue = Payment::where('status', 'completed')
        ->whereDate('payment_datetime', now()->toDateString())
        ->sum('amount_paid');

    // Monthly revenue
    $monthlyRevenue = Payment::where('status', 'completed')
        ->whereYear('payment_datetime', now()->year)
        ->whereMonth('payment_datetime', now()->month)
        ->sum('amount_paid');

    // Total revenue
    $totalRevenue = Payment::where('status', 'completed')->sum('amount_paid');

    // Room stats
    $totalRooms = Room::count();
    $occupiedRooms = Room::where('status', 'occupied')->count();
    $availableRooms = Room::where('status', 'available')->count();
    $maintenanceRooms = Room::where('status', 'maintenance')->count();
    $cleaningRooms = Room::where('status', 'cleaning')->count();
    
    $occupancyRate = $totalRooms > 0 ? round(($occupiedRooms / $totalRooms) * 100, 1) : 0;

    // Today's check-ins (bookings with check_in = today and status != cancelled)
    $todayCheckIns = Booking::whereDate('check_in', now()->toDateString())
        ->whereNotIn('status', ['cancelled', 'no_show'])
        ->count();

    // Today's check-outs
    $todayCheckOuts = Booking::whereDate('check_out', now()->toDateString())
        ->whereNotIn('status', ['cancelled', 'no_show'])
        ->count();

    // Currently checked-in guests (active checkins)
    $activeCheckins = Checkin::where('status', 'active')->count();

    // Pending discount approvals
    $pendingDiscounts = \App\Models\BillDiscount::where('status', 'pending')->count();

    // Recent bookings (last 7 days for chart)
    $recentBookings = Booking::where('created_at', '>=', now()->subDays(7))
        ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
        ->groupBy('date')
        ->orderBy('date', 'asc')
        ->get();

    // Revenue by day for chart (last 7 days)
    $recentRevenue = Payment::where('status', 'completed')
        ->where('payment_datetime', '>=', now()->subDays(7))
        ->selectRaw('DATE(payment_datetime) as date, SUM(amount_paid) as total')
        ->groupBy('date')
        ->orderBy('date', 'asc')
        ->get();

    return response()->json([
        'today_revenue' => $todayRevenue,
        'monthly_revenue' => $monthlyRevenue,
        'total_revenue' => $totalRevenue,
        'occupancy_rate' => $occupancyRate,
        'total_rooms' => $totalRooms,
        'occupied_rooms' => $occupiedRooms,
        'available_rooms' => $availableRooms,
        'maintenance_rooms' => $maintenanceRooms,
        'cleaning_rooms' => $cleaningRooms,
        'today_check_ins' => $todayCheckIns,
        'today_check_outs' => $todayCheckOuts,
        'active_checkins' => $activeCheckins,
        'pending_discounts' => $pendingDiscounts,
        'recent_bookings' => $recentBookings,
        'recent_revenue' => $recentRevenue,
    ]);
}
public function getChartData(Request $request)
{
    $days = $request->query('days', 7);
    
    $revenue = \App\Models\Payment::where('status', 'completed')
        ->where('payment_datetime', '>=', now()->subDays($days))
        ->selectRaw('DATE(payment_datetime) as name, SUM(amount_paid) as revenue')
        ->groupBy('name')
        ->orderBy('name', 'asc')
        ->get()
        ->map(function ($item) {
            return [
                'name' => date('D', strtotime($item->name)),
                'revenue' => floatval($item->revenue)
            ];
        });
    
    // If no data, return sample data for demo
    if ($revenue->isEmpty()) {
        $revenue = collect();
        for ($i = 6; $i >= 0; $i--) {
            $revenue->push([
                'name' => now()->subDays($i)->format('D'),
                'revenue' => 0
            ]);
        }
    }
    
    return response()->json($revenue);
}
}
