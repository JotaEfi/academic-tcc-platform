<?php

namespace App\Http\Controllers;

use App\Models\Offering;
use App\Models\Enrollment;
use App\Models\ClassEvaluation;
use App\Models\Grade;
use App\Models\GradeFormula;
use App\Support\FormulaEvaluator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AcademicProfessorController extends Controller
{
    /**
     * Display a list of classes assigned to the logged-in professor.
     */
    public function classes()
    {
        $courseId = session('course_id', 'si');

        $classes = Offering::where('professor_id', auth()->id())
            ->whereHas('subject', function($query) use ($courseId) {
                $query->where('course_id', $courseId);
            })
            ->with(['subject'])
            ->withCount('enrollments')
            ->get();

        return Inertia::render('Professor/Classes', [
            'classes' => $classes
        ]);
    }

    /**
     * Display the dynamic grading sheet spreadsheet and evaluation configurations.
     */
    public function grades($classId)
    {
        $class = Offering::where('professor_id', auth()->id())
            ->with('subject')
            ->findOrFail($classId);

        $evaluations = ClassEvaluation::where('class_id', $classId)->get();
        $formula = GradeFormula::where('class_id', $classId)->first();

        $enrollments = Enrollment::where('class_id', $classId)
            ->with(['student', 'grades.evaluation'])
            ->get()
            ->map(function ($enrollment) {
                $studentGrades = [];
                foreach ($enrollment->grades as $grade) {
                    if ($grade->evaluation) {
                        $studentGrades[$grade->evaluation->code] = $grade->score;
                    }
                }
                return [
                    'enrollment_id' => $enrollment->id,
                    'student_id' => $enrollment->student_id,
                    'name' => $enrollment->student->name,
                    'grades' => (object)$studentGrades,
                    'final_average' => $enrollment->final_average,
                    'status' => $enrollment->status,
                ];
            });

        return Inertia::render('Professor/ClassGrades', [
            'class' => $class,
            'evaluations' => $evaluations,
            'formula' => $formula ? $formula->formula_expression : '',
            'roster' => $enrollments
        ]);
    }

    /**
     * Create a new evaluation parameter (e.g. P1, Trab) for the class.
     */
    public function storeEvaluation(Request $request, $classId)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:10|alpha_num',
            'type' => 'required|string',
            'max_score' => 'required|numeric|min:0|max:100',
        ]);

        $code = strtoupper($request->input('code'));

        // Check unique code per class
        $exists = ClassEvaluation::where('class_id', $classId)
            ->where('code', $code)
            ->exists();

        if ($exists) {
            return redirect()->back()->with('error', 'Já existe uma avaliação com este código nesta turma.');
        }

        ClassEvaluation::create([
            'class_id' => $classId,
            'name' => $request->input('name'),
            'code' => $code,
            'type' => $request->input('type'),
            'max_score' => $request->input('max_score'),
        ]);

        return redirect()->back()->with('success', 'Avaliação cadastrada com sucesso!');
    }

    /**
     * Delete an evaluation parameter.
     */
    public function destroyEvaluation($classId, $evaluationId)
    {
        ClassEvaluation::where('class_id', $classId)->where('id', $evaluationId)->delete();

        // Run re-calculation in case any scores or formulas were impacted
        $this->recalculateClassGrades($classId);

        return redirect()->back()->with('success', 'Avaliação removida com sucesso!');
    }

    /**
     * Define the custom free-form math formula with AST syntax checking.
     */
    public function storeFormula(Request $request, $classId)
    {
        $request->validate([
            'formula' => 'required|string'
        ]);

        $formulaExpr = str_replace(' ', '', $request->input('formula'));
        $evaluations = ClassEvaluation::where('class_id', $classId)->get();
        $allowedCodes = $evaluations->pluck('code')->toArray();

        $isValid = FormulaEvaluator::validate($formulaExpr, $allowedCodes);
        if (!$isValid) {
            return redirect()->back()->with('error', 'Sintaxe da fórmula inválida ou contém variáveis inexistentes.');
        }

        GradeFormula::updateOrCreate(
            ['class_id' => $classId],
            ['formula_expression' => $formulaExpr]
        );

        // Instantly re-calculate student final averages
        $this->recalculateClassGrades($classId);

        return redirect()->back()->with('success', 'Fórmula de médias configurada e recalculada!');
    }

    /**
     * Save student grades in the class.
     */
    public function saveGrades(Request $request, $classId)
    {
        $request->validate([
            'roster' => 'required|array',
            'roster.*.enrollment_id' => 'required|exists:enrollments,id',
            'roster.*.grades' => 'required|array'
        ]);

        $evaluations = ClassEvaluation::where('class_id', $classId)->get()->keyBy('code');

        try {
            DB::transaction(function() use ($request, $evaluations) {
                foreach ($request->input('roster') as $studentData) {
                    $enrollmentId = $studentData['enrollment_id'];

                    foreach ($studentData['grades'] as $code => $score) {
                        if (isset($evaluations[$code])) {
                            $evaluationId = $evaluations[$code]->id;

                            if ($score === null || $score === '') {
                                Grade::where('enrollment_id', $enrollmentId)
                                    ->where('class_evaluation_id', $evaluationId)
                                    ->delete();
                            } else {
                                Grade::updateOrCreate(
                                    [
                                        'enrollment_id' => $enrollmentId,
                                        'class_evaluation_id' => $evaluationId
                                    ],
                                    [
                                        'score' => (float)$score
                                    ]
                                );
                            }
                        }
                    }
                }
            });
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao salvar notas: ' . $e->getMessage());
        }

        // Run full average evaluation
        $this->recalculateClassGrades($classId);

        return redirect()->back()->with('success', 'Notas salvas com sucesso!');
    }

    /**
     * Recalculate grades for all students in the class.
     */
    private function recalculateClassGrades($classId)
    {
        $formula = GradeFormula::where('class_id', $classId)->first();
        $enrollments = Enrollment::where('class_id', $classId)->with('grades.evaluation')->get();

        if (!$formula) {
            return;
        }

        $formulaExpr = $formula->formula_expression;

        foreach ($enrollments as $enrollment) {
            $studentGrades = [];
            foreach ($enrollment->grades as $grade) {
                if ($grade->evaluation) {
                    $studentGrades[$grade->evaluation->code] = $grade->score;
                }
            }

            try {
                $finalAverage = FormulaEvaluator::evaluate($formulaExpr, $studentGrades);

                // Set status
                $status = 'cursando';
                $evaluationsCount = ClassEvaluation::where('class_id', $classId)->count();
                $gradesCount = $enrollment->grades()->count();

                if ($evaluationsCount > 0 && $gradesCount === $evaluationsCount) {
                    $status = ($finalAverage >= 6.0) ? 'aprovado' : 'reprovado';
                }

                $enrollment->update([
                    'final_average' => $finalAverage,
                    'status' => $status
                ]);
            } catch (\Exception $e) {
                // Ignore evaluation failure on incomplete variable profiles
            }
        }
    }
}
