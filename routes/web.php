<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

use App\Http\Controllers\AdminController;
use App\Http\Controllers\ProfessorController;

Route::get('/', function () {
    return redirect()->route('login'); // Or landing page
})->name('home');

Route::get('/access/{token}', [App\Http\Controllers\AuthController::class, 'magicLogin'])->name('auth.magic');

// Professor Login
Route::get('/professor/login', [App\Http\Controllers\ProfessorAuthController::class, 'create'])->name('professor.login');
Route::post('/professor/login', [App\Http\Controllers\ProfessorAuthController::class, 'store'])->name('professor.login.store');
Route::post('/professor/logout', [App\Http\Controllers\ProfessorAuthController::class, 'destroy'])->name('professor.logout');

// Auth Routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        // Redirect based on role
        if (auth()->user()->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }
        return redirect()->route('professor.dashboard');
    })->name('dashboard');

    // Admin
    Route::get('/admin/dashboard', [AdminController::class, 'index'])->name('admin.dashboard');
    Route::post('/admin/import', [AdminController::class, 'import'])->name('admin.import');
    Route::get('/admin/export', [AdminController::class, 'export'])->name('admin.export');
    Route::get('/admin/evaluated-tccs', [AdminController::class, 'evaluatedTccs'])->name('admin.evaluated_tccs');

    // Professor
    Route::get('/professor/dashboard', [ProfessorController::class, 'index'])->name('professor.dashboard');
    Route::get('/professor/tcc/{id}/evaluate', [ProfessorController::class, 'show'])->name('professor.evaluate');
    Route::post('/professor/tcc/{id}/evaluate', [ProfessorController::class, 'store'])->name('professor.store');
});

require __DIR__.'/settings.php';
