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
        } elseif (auth()->user()->role === 'professor') {
            return redirect()->route('professor.dashboard');
        }
        return redirect()->route('student.dashboard');
    })->name('dashboard');

    // Student
    Route::get('/student/dashboard', [App\Http\Controllers\StudentController::class, 'index'])->name('student.dashboard');

    // Admin
    Route::get('/admin/dashboard', [AdminController::class, 'index'])->name('admin.dashboard');
    Route::get('/admin/results', [AdminController::class, 'results'])->name('admin.results');
    Route::get('/admin/tccs', [AdminController::class, 'tccs'])->name('admin.tccs');
    Route::post('/admin/tccs', [AdminController::class, 'storeTcc'])->name('admin.tccs.store');
    Route::put('/admin/tccs/status', [AdminController::class, 'updateTccStatus'])->name('admin.tccs.status');
    Route::get('/admin/professors', [AdminController::class, 'professors'])->name('admin.professors');
    Route::post('/admin/professors', [AdminController::class, 'storeProfessor'])->name('admin.professors.store');
    Route::put('/admin/professors/{id}', [AdminController::class, 'updateProfessor'])->name('admin.professors.update');
    Route::delete('/admin/professors/{id}', [AdminController::class, 'destroyProfessor'])->name('admin.professors.destroy');
    Route::get('/admin/import', [AdminController::class, 'showImport'])->name('admin.import_show');
    Route::post('/admin/import', [AdminController::class, 'import'])->name('admin.import');
    Route::get('/admin/export', [AdminController::class, 'export'])->name('admin.export');

    // Admin - Academic Phase 2
    Route::get('/admin/subjects', [App\Http\Controllers\AcademicAdminController::class, 'subjects'])->name('admin.subjects');
    Route::post('/admin/subjects', [App\Http\Controllers\AcademicAdminController::class, 'storeSubject'])->name('admin.subjects.store');
    Route::delete('/admin/subjects/{id}', [App\Http\Controllers\AcademicAdminController::class, 'destroySubject'])->name('admin.subjects.destroy');
    Route::get('/admin/classes', [App\Http\Controllers\AcademicAdminController::class, 'classes'])->name('admin.classes');
    Route::post('/admin/classes', [App\Http\Controllers\AcademicAdminController::class, 'storeClass'])->name('admin.classes.store');
    Route::delete('/admin/classes/{id}', [App\Http\Controllers\AcademicAdminController::class, 'destroyClass'])->name('admin.classes.destroy');
    Route::get('/admin/classes/{classId}/roster', [App\Http\Controllers\AcademicAdminController::class, 'roster'])->name('admin.classes.roster');
    Route::post('/admin/classes/{classId}/roster', [App\Http\Controllers\AcademicAdminController::class, 'storeRoster'])->name('admin.classes.roster.store');
    Route::delete('/admin/classes/{classId}/roster/{studentId}', [App\Http\Controllers\AcademicAdminController::class, 'destroyRoster'])->name('admin.classes.roster.destroy');
    Route::post('/admin/classes/{classId}/roster/import', [App\Http\Controllers\AcademicAdminController::class, 'importRoster'])->name('admin.classes.roster.import');

    // Admin - Student Management
    Route::get('/admin/students', [App\Http\Controllers\AcademicAdminController::class, 'students'])->name('admin.students');
    Route::post('/admin/students', [App\Http\Controllers\AcademicAdminController::class, 'storeStudent'])->name('admin.students.store');
    Route::put('/admin/students/{id}', [App\Http\Controllers\AcademicAdminController::class, 'updateStudent'])->name('admin.students.update');
    Route::delete('/admin/students/{id}', [App\Http\Controllers\AcademicAdminController::class, 'destroyStudent'])->name('admin.students.destroy');
    Route::post('/admin/students/import', [App\Http\Controllers\AcademicAdminController::class, 'importStudents'])->name('admin.students.import');

    // Professor
    Route::get('/professor/dashboard', [ProfessorController::class, 'index'])->name('professor.dashboard');
    Route::get('/professor/tcc/{id}/evaluate', [ProfessorController::class, 'show'])->name('professor.evaluate');
    Route::post('/professor/tcc/{id}/evaluate', [ProfessorController::class, 'store'])->name('professor.store');

    // Professor - Academic Phase 2
    Route::get('/professor/classes', [App\Http\Controllers\AcademicProfessorController::class, 'classes'])->name('professor.classes');
    Route::get('/professor/classes/{classId}/grades', [App\Http\Controllers\AcademicProfessorController::class, 'grades'])->name('professor.classes.grades');
    Route::post('/professor/classes/{classId}/evaluations', [App\Http\Controllers\AcademicProfessorController::class, 'storeEvaluation'])->name('professor.classes.evaluations.store');
    Route::delete('/professor/classes/{classId}/evaluations/{evaluationId}', [App\Http\Controllers\AcademicProfessorController::class, 'destroyEvaluation'])->name('professor.classes.evaluations.destroy');
    Route::post('/professor/classes/{classId}/formula', [App\Http\Controllers\AcademicProfessorController::class, 'storeFormula'])->name('professor.classes.formula.store');
    Route::post('/professor/classes/{classId}/grades/save', [App\Http\Controllers\AcademicProfessorController::class, 'saveGrades'])->name('professor.classes.grades.save');

    // Course Context Switcher
    Route::post('/course/switch', function (\Illuminate\Http\Request $request) {
        $request->validate(['course_id' => 'required|string|in:si,ads']);
        $request->session()->put('course_id', $request->input('course_id'));
        return redirect()->back();
    })->name('course.switch');
});

require __DIR__.'/settings.php';
