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

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

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
    Route::post('/bookings/{booking}/cancel', [BookingController::class, 'cancel']);
    Route::apiResource('bookings', BookingController::class)->except(['store']);

    // Front Desk Operations
    Route::post('/checkin/walk-in', [\App\Http\Controllers\CheckinController::class, 'walkIn']);
    Route::post('/checkin/{booking_id}', [\App\Http\Controllers\CheckinController::class, 'processCheckin']);
    Route::post('/checkout/{booking_id}', [\App\Http\Controllers\CheckoutController::class, 'processCheckout']);
    Route::apiResource('addons', \App\Http\Controllers\AddonController::class);

    // Bills & Payments
    Route::apiResource('bills', BillController::class)->only(['show', 'update']);
    Route::get('/bookings/{booking_id}/bill', [BillController::class, 'getByBooking']);
    Route::post('/bills/{bill_id}/items', [BillController::class, 'addItem']);
    Route::post('/bills/{bill_id}/discounts', [BillController::class, 'applyDiscount']);
    Route::post('/payments', [PaymentController::class, 'store']);

    // Reports
    Route::get('/reports/dashboard-stats', [ReportController::class, 'dashboardStats']);
    Route::get('/reports/activity-logs', [ReportController::class, 'activityLogs']);
    Route::post('/reports/log-activity', [ReportController::class, 'logActivity']);

    // Users
    Route::apiResource('users', UserController::class);
});