<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Subject;
use App\Models\Offering;
use App\Models\Enrollment;
use App\Models\ClassEvaluation;
use App\Models\GradeFormula;
use App\Models\Grade;
use App\Models\User;
use App\Support\FormulaEvaluator;
use Illuminate\Database\Seeder;

class AcademicSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Seed Courses
        $si = Course::updateOrCreate(['id' => 'si'], ['name' => 'Sistemas de Informação']);
        $ads = Course::updateOrCreate(['id' => 'ads'], ['name' => 'Análise e Des. de Sistemas']);

        // 2. Seed Subjects for SI
        $siSubjects = [
            ['code' => 'SI101', 'name' => 'Algoritmos e Estruturas de Dados I'],
            ['code' => 'SI202', 'name' => 'Engenharia de Software'],
            ['code' => 'SI303', 'name' => 'Banco de Dados Relacionais'],
        ];
        foreach ($siSubjects as $s) {
            Subject::updateOrCreate(['code' => $s['code']], [
                'course_id' => 'si',
                'name' => $s['name']
            ]);
        }

        // Seed Subjects for ADS
        $adsSubjects = [
            ['code' => 'ADS101', 'name' => 'Desenvolvimento Web com React e Node'],
            ['code' => 'ADS202', 'name' => 'Arquitetura de Software e Microsserviços'],
            ['code' => 'ADS303', 'name' => 'Cibersegurança Aplicada'],
        ];
        foreach ($adsSubjects as $s) {
            Subject::updateOrCreate(['code' => $s['code']], [
                'course_id' => 'ads',
                'name' => $s['name']
            ]);
        }

        // 3. Seed Students
        $studentsData = [
            ['name' => 'Mateus de Souza Oliveira', 'email' => 'mateus.oliveira@example.com', 'course_id' => 'si'],
            ['name' => 'Júlia Camargo Lima', 'email' => 'julia.lima@example.com', 'course_id' => 'si'],
            ['name' => 'Lucas Abreu Medeiros', 'email' => 'lucas.medeiros@example.com', 'course_id' => 'si'],
            ['name' => 'Beatriz Costa Silva', 'email' => 'beatriz.silva@example.com', 'course_id' => 'ads'],
            ['name' => 'Gabriel Ramos Santos', 'email' => 'gabriel.santos@example.com', 'course_id' => 'ads'],
        ];

        $students = collect();
        foreach ($studentsData as $data) {
            $student = User::where('email', $data['email'])->first();
            if (!$student) {
                $student = User::create([
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'password' => bcrypt('password'),
                    'role' => 'student',
                    'course_id' => $data['course_id'],
                ]);
            } else {
                $student->update(['course_id' => $data['course_id']]);
            }
            $students->push($student);
        }

        // 4. Seed Offerings (Classes)
        // Get professors seeded by TccEvaluationSeeder
        $professors = User::where('role', 'professor')->get();
        if ($professors->isEmpty()) {
            return;
        }

        // Class for SI
        $subjectSI = Subject::where('code', 'SI101')->first();
        $profSI = $professors->first();
        $classSI = Offering::updateOrCreate([
            'subject_id' => $subjectSI->id,
            'name' => 'Turma A',
            'period' => '2026.1'
        ], [
            'professor_id' => $profSI->id
        ]);

        // Class for ADS
        $subjectADS = Subject::where('code', 'ADS101')->first();
        $profADS = $professors->skip(1)->first() ?? $profSI;
        $classADS = Offering::updateOrCreate([
            'subject_id' => $subjectADS->id,
            'name' => 'Turma B',
            'period' => '2026.1'
        ], [
            'professor_id' => $profADS->id
        ]);

        // 5. Enroll Students
        foreach ($students as $student) {
            // Enroll in SI Class
            Enrollment::updateOrCreate([
                'class_id' => $classSI->id,
                'student_id' => $student->id
            ], [
                'status' => 'cursando'
            ]);

            // Enroll in ADS Class
            Enrollment::updateOrCreate([
                'class_id' => $classADS->id,
                'student_id' => $student->id
            ], [
                'status' => 'cursando'
            ]);
        }

        // 6. Seed Evaluations for SI Class
        $evalSI1 = ClassEvaluation::updateOrCreate([
            'class_id' => $classSI->id,
            'code' => 'P1'
        ], [
            'name' => 'Prova 1',
            'type' => 'prova',
            'max_score' => 10.0
        ]);

        $evalSI2 = ClassEvaluation::updateOrCreate([
            'class_id' => $classSI->id,
            'code' => 'T1'
        ], [
            'name' => 'Trabalho 1',
            'type' => 'trabalho',
            'max_score' => 10.0
        ]);

        $evalSI3 = ClassEvaluation::updateOrCreate([
            'class_id' => $classSI->id,
            'code' => 'PROJ'
        ], [
            'name' => 'Projeto Final',
            'type' => 'projeto',
            'max_score' => 10.0
        ]);

        // 7. Seed Formula for SI Class: (P1 * 0.3) + (T1 * 0.2) + (PROJ * 0.5)
        GradeFormula::updateOrCreate([
            'class_id' => $classSI->id
        ], [
            'formula_expression' => '(P1*0.3)+(T1*0.2)+(PROJ*0.5)'
        ]);

        // 8. Seed Grades for SI Class
        $enrollmentsSI = Enrollment::where('class_id', $classSI->id)->get();
        foreach ($enrollmentsSI as $index => $enrollment) {
            $p1Score = 7.0 + ($index * 0.5);
            $t1Score = 8.0 - ($index * 0.3);
            $projScore = 6.5 + ($index * 0.7);

            Grade::updateOrCreate([
                'enrollment_id' => $enrollment->id,
                'class_evaluation_id' => $evalSI1->id
            ], ['score' => min(10.0, $p1Score)]);

            Grade::updateOrCreate([
                'enrollment_id' => $enrollment->id,
                'class_evaluation_id' => $evalSI2->id
            ], ['score' => min(10.0, $t1Score)]);

            Grade::updateOrCreate([
                'enrollment_id' => $enrollment->id,
                'class_evaluation_id' => $evalSI3->id
            ], ['score' => min(10.0, $projScore)]);
        }

        // Run re-calculation helper manually for SI Class
        $this->recalculateClass($classSI->id);
    }

    private function recalculateClass($classId)
    {
        $formula = GradeFormula::where('class_id', $classId)->first();
        $enrollments = Enrollment::where('class_id', $classId)->with('grades.evaluation')->get();
        if (!$formula) return;

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
                $status = ($finalAverage >= 6.0) ? 'aprovado' : 'reprovado';
                $enrollment->update([
                    'final_average' => $finalAverage,
                    'status' => $status
                ]);
            } catch (\Exception $e) {
                // Silence formula errors during seed
            }
        }
    }
}
