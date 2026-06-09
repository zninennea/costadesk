<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\BillController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\GuestViolationController;

Route::middleware('throttle:10,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('throttle:60,1')->group(function () {
    // Public Room Routes
    Route::get('/rooms', [RoomController::class, 'index']);
    Route::get('/rooms/categories', [RoomController::class, 'categories']);
    Route::get('/rooms/available', [RoomController::class, 'available']);
    Route::get('/rooms/{room}', [RoomController::class, 'show']);

    // Public Bookings
    Route::post('/bookings', [BookingController::class, 'store']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Rooms (Admin)
    Route::apiResource('rooms', RoomController::class)->except(['index', 'show']);

    // Bookings
    Route::post('/bookings/manual-reserve', [BookingController::class, 'manualReserve']);
    Route::post('/bookings/{booking}/cancel', [BookingController::class, 'cancel']);
    Route::apiResource('bookings', BookingController::class)->except(['store']);

    // Front Desk Operations
    Route::post('/checkin/walk-in', [\App\Http\Controllers\CheckinController::class, 'walkIn']);
    Route::post('/checkin/{booking_id}', [\App\Http\Controllers\CheckinController::class, 'processCheckin']);
    Route::post('/checkout/{booking_id}', [\App\Http\Controllers\CheckoutController::class, 'processCheckout']);
    Route::apiResource('addons', \App\Http\Controllers\AddonController::class);
    Route::apiResource('guest-violations', GuestViolationController::class);

    // Bills & Payments
    Route::get('/bills/pending-discounts', [BillController::class, 'getPendingDiscounts']);
    Route::post('/bills/discounts/{id}/approve', [BillController::class, 'approveDiscount']);
    Route::post('/bills/discounts/{id}/reject', [BillController::class, 'rejectDiscount']);
    Route::apiResource('bills', BillController::class)->only(['index', 'show', 'update']);
    Route::get('/bookings/{booking_id}/bill', [BillController::class, 'getByBooking']);
    Route::post('/bills/{bill_id}/items', [BillController::class, 'addItem']);
    Route::post('/bills/{bill_id}/discounts', [BillController::class, 'applyDiscount']);
    Route::post('/payments', [PaymentController::class, 'store']);

    // Reports
    Route::get('/reports/dashboard-stats', [ReportController::class, 'dashboardStats']);
    Route::get('/reports/activity-logs', [ReportController::class, 'activityLogs']);
    Route::post('/reports/log-activity', [ReportController::class, 'logActivity']);
    Route::get('/reports/real-dashboard-stats', [ReportController::class, 'getRealDashboardStats']);
    Route::get('/reports/pending-discounts', [BillController::class, 'getPendingDiscounts']);
    Route::post('/bills/{bill}/discounts/{discount}/approve', [BillController::class, 'approveDiscount']);
    Route::post('/bills/{bill}/discounts/{discount}/reject', [BillController::class, 'rejectDiscount']);
    Route::get('/violations', [GuestViolationController::class, 'index']);
    Route::post('/violations', [GuestViolationController::class, 'store']);
    Route::put('/violations/{id}', [GuestViolationController::class, 'update']);
    Route::delete('/violations/{id}', [GuestViolationController::class, 'destroy']);
    Route::get('/rooms/status-log', [RoomController::class, 'getStatusLog']);
    Route::get('/reports/chart-data', [ReportController::class, 'getChartData']);
        // Users
        Route::apiResource('users', UserController::class);

        // Under-development panels endpoints
        Route::apiResource('guests', \App\Http\Controllers\GuestController::class);
        Route::post('/guests/{guest}/blacklist', [\App\Http\Controllers\GuestController::class, 'blacklist']);
        Route::get('/role-permissions', [\App\Http\Controllers\RolePermissionController::class, 'index']);
        Route::post('/role-permissions', [\App\Http\Controllers\RolePermissionController::class, 'update']);
        Route::get('/archives', [\App\Http\Controllers\ArchiveController::class, 'index']);
        Route::post('/archives/restore', [\App\Http\Controllers\ArchiveController::class, 'restore']);
    });
});