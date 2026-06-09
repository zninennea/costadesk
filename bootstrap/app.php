<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->renderable(function (\Throwable $e, Request $request) {
            if ($request->is('api/*')) {
                // Don't expose validation errors as system errors
                if ($e instanceof \Illuminate\Validation\ValidationException) {
                    return response()->json([
                        'message' => 'Validation failed',
                        'errors' => $e->errors()
                    ], 422);
                }
                
                // Don't expose authentication errors
                if ($e instanceof \Illuminate\Auth\AuthenticationException) {
                    return response()->json([
                        'message' => 'Unauthenticated. Please login again.'
                    ], 401);
                }
                
                // Log the actual error for debugging
                \Illuminate\Support\Facades\Log::error('API Error: ' . $e->getMessage(), [
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'user_id' => auth('sanctum')->id()
                ]);
                
                // Return user-friendly message in production
                if (!config('app.debug')) {
                    return response()->json([
                        'message' => 'An unexpected error occurred. Our team has been notified.'
                    ], 500);
                }
            }
        });
    })->create();