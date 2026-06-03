<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Subject;
use App\Models\Offering;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AcademicAdminController extends Controller
{
    /**
     * Display a list of subjects for the active course.
     */
    public function subjects()
    {
        $subjects = Subject::all();
        return Inertia::render('Admin/Subjects', [
            'subjects' => $subjects
        ]);
    }

    /**
     * Store a new subject.
     */
    public function storeSubject(Request $request)
    {
        $request->validate([
            'code' => 'required|string|unique:subjects,code',
            'name' => 'required|string|max:255',
            'course_id' => 'required|string|in:si,ads',
        ]);

        Subject::create([
            'course_id' => $request->input('course_id'),
            'code' => strtoupper($request->input('code')),
            'name' => $request->input('name')
        ]);

        return redirect()->back()->with('success', 'Disciplina cadastrada com sucesso!');
    }

    /**
     * Remove the specified subject.
     */
    public function destroySubject($id)
    {
        Subject::destroy($id);
        return redirect()->back()->with('success', 'Disciplina removida com sucesso!');
    }

    /**
     * Display a list of classes (offering) for the active course.
     */
    public function classes()
    {
        $subjects = Subject::all();
        $professors = User::where('role', 'professor')->get();
        
        $classes = Offering::with(['subject', 'professor'])
            ->withCount('enrollments')
            ->get();

        return Inertia::render('Admin/Classes', [
            'classes' => $classes,
            'subjects' => $subjects,
            'professors' => $professors,
        ]);
    }

    /**
     * Store a newly created class offering.
     */
    public function storeClass(Request $request)
    {
        $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'professor_id' => 'required|exists:users,id',
            'period' => 'required|string|max:20',
            'name' => 'required|string|max:255',
        ]);

        Offering::create($request->all());

        return redirect()->back()->with('success', 'Turma instanciada com sucesso!');
    }

    /**
     * Remove the specified class offering.
     */
    public function destroyClass($id)
    {
        Offering::destroy($id);
        return redirect()->back()->with('success', 'Turma removida com sucesso!');
    }

    /**
     * Display student roster for a specific class.
     */
    public function roster($classId)
    {
        $class = Offering::with(['subject', 'professor'])->findOrFail($classId);
        
        // Find existing enrolled students
        $enrollments = Enrollment::where('class_id', $classId)
            ->with('student')
            ->get();

        // Get all students inside the system for selection
        $students = User::where('role', 'student')->get();

        return Inertia::render('Admin/Roster', [
            'class' => $class,
            'enrollments' => $enrollments,
            'students' => $students
        ]);
    }

    /**
     * Manually enroll a student into a class.
     */
    public function storeRoster(Request $request, $classId)
    {
        $request->validate([
            'student_id' => 'required|exists:users,id'
        ]);

        $exists = Enrollment::where('class_id', $classId)
            ->where('student_id', $request->input('student_id'))
            ->exists();

        if ($exists) {
            return redirect()->back()->with('error', 'Aluno já está matriculado nesta turma.');
        }

        Enrollment::create([
            'class_id' => $classId,
            'student_id' => $request->input('student_id'),
            'status' => 'cursando'
        ]);

        return redirect()->back()->with('success', 'Aluno matriculado com sucesso!');
    }

    /**
     * Remove a student enrollment from a class.
     */
    public function destroyRoster($classId, $studentId)
    {
        Enrollment::where('class_id', $classId)
            ->where('student_id', $studentId)
            ->delete();

        return redirect()->back()->with('success', 'Matrícula removida com sucesso!');
    }

    /**
     * Bulk import students and enroll them via CSV.
     */
    public function importRoster(Request $request, $classId)
    {
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt'
        ]);

        $file = $request->file('csv_file');
        $lines = file($file->getRealPath());

        // Parse delimiter
        $firstLine = $lines[0] ?? '';
        $delimiter = (substr_count($firstLine, "\t") > substr_count($firstLine, ",")) ? "\t" : ",";

        $data = array_map(function($line) use ($delimiter) {
            return str_getcsv($line, $delimiter);
        }, $lines);

        // Skip header row
        $data = array_slice($data, 1);

        try {
            DB::transaction(function() use ($data, $classId) {
                foreach ($data as $row) {
                    if (count($row) < 2 || empty($row[0])) {
                        continue; // Skip invalid rows
                    }

                    $studentName = trim($row[0]);
                    $studentEmail = trim($row[1]);

                    // Find or create student user
                    $student = User::where('email', $studentEmail)->first();
                    if (!$student) {
                        $student = User::create([
                            'name' => $studentName,
                            'email' => $studentEmail,
                            'password' => bcrypt('password'), // simple fallback
                            'role' => 'student',
                        ]);
                    }

                    // Enroll student
                    Enrollment::firstOrCreate([
                        'class_id' => $classId,
                        'student_id' => $student->id
                    ], [
                        'status' => 'cursando'
                    ]);
                }
            });
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Falha ao processar o CSV: ' . $e->getMessage());
        }

        return redirect()->back()->with('success', 'Alunos importados e matriculados com sucesso!');
    }

    /**
     * Display a list of students in the system.
     */
    public function students()
    {
        $students = User::where('role', 'student')
            ->with([
                'course',
                'enrollments.offering.subject',
                'enrollments.offering.professor',
                'enrollments.offering.formula',
                'enrollments.offering.evaluations',
                'enrollments.grades.evaluation'
            ])
            ->get()
            ->map(function ($student) {
                $formattedEnrollments = $student->enrollments->map(function ($enrollment) {
                    $offering = $enrollment->offering;
                    $subject = $offering ? $offering->subject : null;
                    $professor = $offering ? $offering->professor : null;
                    $evaluations = $offering ? $offering->evaluations : collect();

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

                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'course_id' => $student->course_id,
                    'course' => $student->course,
                    'enrollments' => $formattedEnrollments
                ];
            });

        $courses = Course::all();

        return Inertia::render('Admin/Students', [
            'students' => $students,
            'courses' => $courses
        ]);
    }

    /**
     * Store a newly created student.
     */
    public function storeStudent(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'course_id' => 'required|string|exists:courses,id',
            'password' => 'nullable|string|min:6',
        ]);

        User::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => bcrypt($request->input('password') ?: 'password'),
            'role' => 'student',
            'course_id' => $request->input('course_id'),
        ]);

        return redirect()->back()->with('success', 'Aluno cadastrado com sucesso!');
    }

    /**
     * Update the specified student.
     */
    public function updateStudent(Request $request, $id)
    {
        $student = User::where('role', 'student')->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $id,
            'course_id' => 'required|string|exists:courses,id',
            'password' => 'nullable|string|min:6',
        ]);

        $data = [
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'course_id' => $request->input('course_id'),
        ];

        if ($request->filled('password')) {
            $data['password'] = bcrypt($request->input('password'));
        }

        $student->update($data);

        return redirect()->back()->with('success', 'Aluno atualizado com sucesso!');
    }

    /**
     * Remove the specified student.
     */
    public function destroyStudent($id)
    {
        $student = User::where('role', 'student')->findOrFail($id);
        $student->delete();

        return redirect()->back()->with('success', 'Aluno removido com sucesso!');
    }

    /**
     * Bulk import students via CSV.
     */
    public function importStudents(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt',
        ]);

        $file = $request->file('csv_file');
        $lines = file($file->getRealPath());

        // Parse delimiter
        $firstLine = $lines[0] ?? '';
        $delimiter = (substr_count($firstLine, "\t") > substr_count($firstLine, ",")) ? "\t" : ",";

        $data = array_map(function($line) use ($delimiter) {
            return str_getcsv($line, $delimiter);
        }, $lines);

        // Skip header row
        $data = array_slice($data, 1);

        try {
            DB::transaction(function() use ($data) {
                foreach ($data as $row) {
                    if (count($row) < 2 || empty($row[0])) {
                        continue; // Skip invalid rows
                    }

                    $studentName = trim($row[0]);
                    $studentEmail = trim($row[1]);
                    
                    // Fallback to 'si' if course_id is empty or doesn't exist in row
                    $courseId = !empty($row[2]) ? strtolower(trim($row[2])) : 'si';
                    if (!in_array($courseId, ['si', 'ads'])) {
                        $courseId = 'si';
                    }

                    // Find or create student user
                    $student = User::where('email', $studentEmail)->first();
                    if (!$student) {
                        User::create([
                            'name' => $studentName,
                            'email' => $studentEmail,
                            'password' => bcrypt('password'), // simple fallback
                            'role' => 'student',
                            'course_id' => $courseId,
                        ]);
                    } else {
                        // Update course and role if they exist but aren't assigned properly
                        $student->update([
                            'role' => 'student',
                            'course_id' => $courseId
                        ]);
                    }
                }
            });
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Falha ao processar o CSV: ' . $e->getMessage());
        }

        return redirect()->back()->with('success', 'Alunos importados com sucesso!');
    }
}
