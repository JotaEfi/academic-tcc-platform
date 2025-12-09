<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Tcc;
use Inertia\Inertia;
use Carbon\Carbon;

class AdminController extends Controller
{
    public function index()
    {
        $tccs = Tcc::with(['evaluations.user', 'orientador', 'evaluators'])->get()->map(function ($tcc) {
            // Cálculo alinhado com a tela de TCCs avaliados
            $etapa1Evals = $tcc->evaluations->where('stage', 'etapa1');
            $etapa2Evals = $tcc->evaluations->where('stage', 'etapa2');

            $etapa1Avg = 0;
            if ($etapa1Evals->count() > 0) {
                $totalGrade = $etapa1Evals->sum(function ($ev) {
                    $score = $ev->etapa1Score();
                    return $score !== null ? $score : 0;
                });
                $etapa1Avg = $totalGrade / $etapa1Evals->count();
            }

            $etapa2Avg = 0;
            if ($etapa2Evals->count() > 0) {
                $totalGrade = $etapa2Evals->sum(function ($ev) {
                    $score = $ev->etapa2Score();
                    return $score !== null ? $score : 0;
                });
                $etapa2Avg = $totalGrade / $etapa2Evals->count();
            }

            // Nota final geral, mesma regra da tela de avaliados
            $evaluationsByUser = $tcc->evaluations->groupBy('user_id');

            $allEvaluators = $tcc->evaluators;
            if ($tcc->orientador && !$allEvaluators->contains('id', $tcc->orientador->id)) {
                $allEvaluators = $allEvaluators->concat(collect([$tcc->orientador]));
            }

            $professorGrades = $allEvaluators->map(function ($evaluator) use ($evaluationsByUser) {
                $evaluationsByProfessor = $evaluationsByUser->get($evaluator->id, collect());

                $etapa1Eval = $evaluationsByProfessor->firstWhere('stage', 'etapa1');
                $etapa2Eval = $evaluationsByProfessor->firstWhere('stage', 'etapa2');

                $etapa1Grade = $etapa1Eval ? $etapa1Eval->etapa1Score() : null;
                $etapa2Grade = $etapa2Eval ? $etapa2Eval->etapa2Score() : null;

                $final = null;
                if ($etapa1Grade !== null && $etapa2Grade !== null) {
                    $final = ($etapa1Grade * 0.7) + ($etapa2Grade * 0.3);
                } elseif ($etapa1Grade !== null) {
                    $final = $etapa1Grade;
                } elseif ($etapa2Grade !== null) {
                    $final = $etapa2Grade;
                }

                return [
                    'final_grade' => $final !== null ? round($final, 2) : null,
                ];
            });

            $validProfessorGrades = $professorGrades->whereNotNull('final_grade');
            if ($validProfessorGrades->count() === $professorGrades->count() && $professorGrades->count() > 0) {
                $finalAvg = $validProfessorGrades->avg('final_grade');
            } else {
                $finalAvg = null;
            }

            return [
                'id' => $tcc->id,
                'title' => $tcc->title,
                'student' => $tcc->student,
                'orientador' => $tcc->orientador ? $tcc->orientador->name : 'N/A',
                'location' => $tcc->location,
                'defense_date' => $tcc->defense_date ? Carbon::parse($tcc->defense_date)->format('d/m/Y') : null,
                'defense_time' => $tcc->defense_time,
                'average' => $finalAvg !== null ? round($finalAvg, 2) : null,
                'evaluations_count' => $tcc->evaluations->count(),
                'evaluators_count' => $tcc->evaluators->count(),
                'evaluators' => $allEvaluators->pluck('name'),
            ];
        });

        $professors = \App\Models\User::where('role', 'professor')
            ->select('id', 'name', 'temp_password', 'access_token')
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'tccs' => $tccs,
            'professors' => $professors,
        ]);
    }

    public function import(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt',
        ]);

        $file = $request->file('csv_file');
        $lines = file($file->getRealPath());
        
        // Auto-detect delimiter
        $firstLine = $lines[0] ?? '';
        $tabCount = substr_count($firstLine, "\t");
        $commaCount = substr_count($firstLine, ",");
        $delimiter = ($tabCount > $commaCount) ? "\t" : ",";
        
        \Log::info("CSV Delimiter detected", ['delimiter' => $delimiter === "\t" ? 'TAB' : 'COMMA']);
        
        $data = array_map(function($line) use ($delimiter) {
            return str_getcsv($line, $delimiter);
        }, $lines);
        
        // Skip header row (assume first row is header)
        $data = array_slice($data, 1);
        
        foreach ($data as $rowIndex => $row) {
            // Expected format: ID | PROJETO | ALUNO | ORIENTADOR | AVALIADORES | LOCAL | DATA/HORA
            // Example: TCC01 | Análise de Dados | João Silva | Prof. Maria | Prof. Pedro, Prof. Ana | Sala 1E | 09/12 - 17:00 às 17:50
            
            if (count($row) < 7 || empty($row[0])) {
                continue; // Skip invalid rows
            }
            
            $tccId = trim($row[0]);
            $title = trim($row[1]);
            $student = trim($row[2]);
            $orientadorName = trim($row[3]);
            $avaliadoresString = trim($row[4]);
            $location = trim($row[5]);
            $dateTime = trim($row[6]);
            
            // Parse date and time from formats like "09/12, 17h30 às 18h15"
            $defenseDate = null;
            $defenseTime = null;

            if (!empty($dateTime)) {
                // Extrai a parte da data (dd/mm)
                if (preg_match('/(\d{2}\/\d{2})/', $dateTime, $mDate)) {
                    $dateStr = $mDate[1]; // "09/12"
                    $year = date('Y');
                    $defenseDate = \Carbon\Carbon::createFromFormat('d/m/Y', $dateStr . '/' . $year)->format('Y-m-d');
                }

                // Extrai o trecho de horário, aceitando formatos como "17h30 às 18h15" ou similares
                if (preg_match('/(\d{1,2}h\d{2}.*)$/u', $dateTime, $mTime)) {
                    $defenseTime = trim($mTime[1]);
                }
            }
            
            // Find or create orientador
            $orientador = \App\Models\User::where('role', 'professor')
                ->where('name', 'LIKE', '%' . $orientadorName . '%')
                ->first();
                
            if (!$orientador) {
                $email = strtolower(str_replace(' ', '.', $orientadorName)) . '@example.com';
                $tempPassword = \Illuminate\Support\Str::random(8);
                
                $orientador = \App\Models\User::create([
                    'name' => $orientadorName,
                    'email' => $email,
                    'password' => bcrypt($tempPassword),
                    'temp_password' => $tempPassword,
                    'role' => 'professor',
                ]);
            }
            
            // Create or update TCC
            $tcc = Tcc::updateOrCreate(
                ['id' => $tccId],
                [
                    'title' => $title,
                    'student' => $student,
                    'location' => $location,
                    'orientador_id' => $orientador->id,
                    'defense_date' => $defenseDate,
                    'defense_time' => $defenseTime,
                ]
            );
            
            // Associate avaliadores (evaluators)
            if (!empty($avaliadoresString)) {
                $this->associateEvaluators($tcc, $avaliadoresString);
            }
        }

        return redirect()->back()->with('success', 'TCCs importados com sucesso!');
    }

    private function associateEvaluators($tcc, $avaliadoresString)
    {
        // Remover aspas duplas e espaços extras
        $avaliadoresString = str_replace('"', '', $avaliadoresString);
        $avaliadoresString = str_replace('“', '', $avaliadoresString);
        $avaliadoresString = str_replace('”', '', $avaliadoresString);
        $avaliadoresString = trim($avaliadoresString);

        // Parse comma-separated evaluator names
        $evaluatorNames = array_map(function($name) {
            return trim(str_replace(['"', '“', '”'], '', $name));
        }, explode(',', $avaliadoresString));

        $evaluatorIds = [];
        foreach ($evaluatorNames as $name) {
            if (empty($name) || strlen($name) < 3) continue;
            
            // Find evaluator by name
            $evaluator = \App\Models\User::where('role', 'professor')
                ->where('name', 'LIKE', '%' . $name . '%')
                ->first();
            
            // If evaluator doesn't exist, create them
            if (!$evaluator) {
                $email = strtolower(str_replace(' ', '.', $name)) . '@example.com';
                $tempPassword = \Illuminate\Support\Str::random(8);
                
                $evaluator = \App\Models\User::create([
                    'name' => $name,
                    'email' => $email,
                    'password' => bcrypt($tempPassword),
                    'temp_password' => $tempPassword,
                    'role' => 'professor',
                ]);
            }
            
            if ($evaluator) {
                $evaluatorIds[] = $evaluator->id;
            }
        }
        
        // Sync evaluators to TCC
        if (!empty($evaluatorIds)) {
            $tcc->evaluators()->sync($evaluatorIds);
        }
    }
    public function export()
    {
        $tccs = Tcc::with(['evaluations', 'orientador', 'evaluators'])->get()->map(function ($tcc) {
            // Calculate averages per stage
            $etapa1Evals = $tcc->evaluations->where('stage', 'etapa1');
            $etapa2Evals = $tcc->evaluations->where('stage', 'etapa2');
            
            $etapa1Avg = 0;
            if ($etapa1Evals->count() > 0) {
                $totalGrade = $etapa1Evals->sum(function ($ev) {
                    $scores = $ev->scores;
                    if (empty($scores)) return 0;
                    return array_sum($scores) / count($scores);
                });
                $etapa1Avg = $totalGrade / $etapa1Evals->count();
            }
            
            $etapa2Avg = 0;
            if ($etapa2Evals->count() > 0) {
                $totalGrade = $etapa2Evals->sum(function ($ev) {
                    $scores = $ev->scores;
                    if (empty($scores)) return 0;
                    return array_sum($scores) / count($scores);
                });
                $etapa2Avg = $totalGrade / $etapa2Evals->count();
            }
            
            $finalAvg = ($etapa1Avg + $etapa2Avg) / 2;
            
            return [
                'id' => $tcc->id,
                'title' => $tcc->title,
                'student' => $tcc->student,
                'orientador' => $tcc->orientador ? $tcc->orientador->name : 'N/A',
                'location' => $tcc->location,
                'defense_date' => $tcc->defense_date ? Carbon::parse($tcc->defense_date)->format('d/m/Y') : 'N/A',
                'defense_time' => $tcc->defense_time ?? 'N/A',
                'etapa1_avg' => round($etapa1Avg, 2),
                'etapa2_avg' => round($etapa2Avg, 2),
                'final_avg' => round($finalAvg, 2),
            ];
        });

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=tccs_export.csv",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function() use ($tccs) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Título', 'Aluno', 'Orientador', 'Local', 'Data Defesa', 'Horário', 'Média Etapa 1', 'Média Etapa 2', 'Média Final']);

            foreach ($tccs as $tcc) {
                fputcsv($file, [
                    $tcc['id'],
                    $tcc['title'],
                    $tcc['student'],
                    $tcc['orientador'],
                    $tcc['location'],
                    $tcc['defense_date'],
                    $tcc['defense_time'],
                    $tcc['etapa1_avg'],
                    $tcc['etapa2_avg'],
                    $tcc['final_avg']
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function evaluatedTccs()
    {
        // Fetch TCCs that have at least one evaluation
        $tccs = Tcc::has('evaluations')->with(['evaluations.user', 'orientador', 'evaluators'])->get()->map(function ($tcc) {
            // Calculate averages per stage using domain methods on Evaluation
            $etapa1Evals = $tcc->evaluations->where('stage', 'etapa1');
            $etapa2Evals = $tcc->evaluations->where('stage', 'etapa2');

            $etapa1Avg = 0;
            if ($etapa1Evals->count() > 0) {
                $totalGrade = $etapa1Evals->sum(function ($ev) {
                    $score = $ev->etapa1Score();
                    return $score !== null ? $score : 0;
                });
                $etapa1Avg = $totalGrade / $etapa1Evals->count();
            }

            $etapa2Avg = 0;
            if ($etapa2Evals->count() > 0) {
                $totalGrade = $etapa2Evals->sum(function ($ev) {
                    $score = $ev->etapa2Score();
                    return $score !== null ? $score : 0;
                });
                $etapa2Avg = $totalGrade / $etapa2Evals->count();
            }

            // Prepare professor grades detail grouped by professor, incluindo avaliadores que ainda não avaliaram
            $evaluationsByUser = $tcc->evaluations->groupBy('user_id');

            // Constrói a lista completa de avaliadores: banca + orientador
            $allEvaluators = $tcc->evaluators;
            if ($tcc->orientador && !$allEvaluators->contains('id', $tcc->orientador->id)) {
                $allEvaluators = $allEvaluators->concat(collect([$tcc->orientador]));
            }

            $professorGrades = $allEvaluators->map(function ($evaluator) use ($evaluationsByUser) {
                $evaluationsByProfessor = $evaluationsByUser->get($evaluator->id, collect());

                $etapa1Eval = $evaluationsByProfessor->firstWhere('stage', 'etapa1');
                $etapa2Eval = $evaluationsByProfessor->firstWhere('stage', 'etapa2');

                $etapa1Grade = $etapa1Eval ? $etapa1Eval->etapa1Score() : null;
                $etapa2Grade = $etapa2Eval ? $etapa2Eval->etapa2Score() : null;

                $final = null;
                if ($etapa1Grade !== null && $etapa2Grade !== null) {
                    // Nota final do professor: 70% Etapa 1, 30% Etapa 2
                    $final = ($etapa1Grade * 0.7) + ($etapa2Grade * 0.3);
                } elseif ($etapa1Grade !== null) {
                    $final = $etapa1Grade;
                } elseif ($etapa2Grade !== null) {
                    $final = $etapa2Grade;
                }

                return [
                    'professor' => $evaluator->name,
                    'etapa1_grade' => $etapa1Grade !== null ? round($etapa1Grade, 2) : null,
                    'etapa2_grade' => $etapa2Grade !== null ? round($etapa2Grade, 2) : null,
                    'final_grade' => $final !== null ? round($final, 2) : null,
                ];
            });

            // Final average of the TCC: média das notas finais individuais dos professores
            $validProfessorGrades = $professorGrades->whereNotNull('final_grade');
            // Só calcula média geral se TODOS os avaliadores tiverem nota final individual
            if ($validProfessorGrades->count() === $professorGrades->count() && $professorGrades->count() > 0) {
                $finalAvg = $validProfessorGrades->avg('final_grade');
            } else {
                // Enquanto nem todos avaliadores tiverem nota final, consideramos pendente
                $finalAvg = null;
            }

            return [
                'id' => $tcc->id,
                'title' => $tcc->title,
                'student' => $tcc->student,
                'orientador' => $tcc->orientador ? $tcc->orientador->name : 'N/A',
                'defense_date' => $tcc->defense_date ? Carbon::parse($tcc->defense_date)->format('d/m/Y') : null,
                'defense_time' => $tcc->defense_time,
                // Lista de avaliadores exibidos (inclui orientador se ele também avalia)
                'evaluators' => $allEvaluators->pluck('name'),
                'location' => $tcc->location,
                'etapa1_average' => round($etapa1Avg, 2),
                'etapa2_average' => round($etapa2Avg, 2),
                'final_average' => $finalAvg !== null ? round($finalAvg, 2) : null,
                'professor_grades' => $professorGrades
            ];
        });
        
        return Inertia::render('Admin/EvaluatedTccs', ['tccs' => $tccs]);
    }

    
    public function resetDatabase(Request $request) 
    {
        // Protect against accidental execution (double check if needed, but UI confirmation handles first layer)
        // Additional auth middleware handles the second layer.
        
        try {
            // Explicitly for SQLite
            if (\DB::getDriverName() == 'sqlite') {
                \DB::statement('PRAGMA foreign_keys = OFF;');
            }
            \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();

            \DB::transaction(function () {
                // 1. Delete Evaluations
                \App\Models\Evaluation::query()->delete();
                
                // 2. Clear relationships
                \DB::table('tcc_evaluator')->delete();
                \DB::table('project_user')->delete();
                
                // 3. Delete TCCs and Projects
                \App\Models\Tcc::query()->delete();
                \App\Models\Project::query()->delete();
                
                // 4. Delete Users (Except Admin)
                \App\Models\User::where('role', '!=', 'admin')->delete();

                // Reset Auto Increment if possible (SQLite specific)
                if (\DB::getDriverName() == 'sqlite') {
                    \DB::statement("DELETE FROM sqlite_sequence WHERE name IN ('evaluations', 'tccs', 'projects', 'users')");
                }
            });
        } catch (\Throwable $e) {
            return redirect()->back()->withErrors(['error' => 'Erro ao resetar: ' . $e->getMessage()]);
        } finally {
             if (\DB::getDriverName() == 'sqlite') {
                \DB::statement('PRAGMA foreign_keys = ON;');
            }
            \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();
        }

        return redirect()->route('admin.dashboard')->with('success', 'Banco de dados resetado com sucesso! Apenas o usuário Admin foi mantido.');
    }
}
