<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StudentController extends Controller
{
    /**
     * Display the student academic dashboard with general grades and Boletim.
     */
    public function index()
    {
        $student = Auth::user();

        // Get student enrollments with classes, subjects, professors, evaluations and grades
        $enrollments = Enrollment::where('student_id', $student->id)
            ->with([
                'offering.subject',
                'offering.professor',
                'offering.formula',
                'offering.evaluations',
                'grades.evaluation'
            ])
            ->get()
            ->map(function ($enrollment) {
                $offering = $enrollment->offering;
                $subject = $offering ? $offering->subject : null;
                $professor = $offering ? $offering->professor : null;
                
                // Get all evaluations for this class offering
                $evaluations = $offering ? $offering->evaluations : collect();
                
                // Map student's logged scores by evaluation code
                $studentGrades = [];
                foreach ($enrollment->grades as $grade) {
                    if ($grade->evaluation) {
                        $studentGrades[$grade->evaluation->code] = $grade->score;
                    }
                }
                
                return [
                    'enrollment_id' => $enrollment->id,
                    'class_name' => $offering ? $offering->name : 'N/A',
                    'period' => $offering ? $offering->period : 'N/A',
                    'subject' => $subject ? [
                        'code' => $subject->code,
                        'name' => $subject->name,
                        'course_id' => $subject->course_id,
                    ] : null,
                    'professor' => $professor ? [
                        'name' => $professor->name,
                        'email' => $professor->email,
                    ] : null,
                    'evaluations' => $evaluations->map(function ($eval) use ($studentGrades) {
                        return [
                            'id' => $eval->id,
                            'name' => $eval->name,
                            'code' => $eval->code,
                            'type' => $eval->type,
                            'max_score' => $eval->max_score,
                            'score' => $studentGrades[$eval->code] ?? null,
                        ];
                    }),
                    'formula' => $offering && $offering->formula ? $offering->formula->formula_expression : null,
                    'final_average' => $enrollment->final_average,
                    'status' => $enrollment->status,
                ];
            });

        return Inertia::render('Student/Dashboard', [
            'enrollments' => $enrollments
        ]);
    }
}
