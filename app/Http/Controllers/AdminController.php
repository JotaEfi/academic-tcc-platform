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
        $totalTccs = Tcc::count();
        $totalProfessors = \App\Models\User::where('role', 'professor')->count();
        $evaluatedTccs = Tcc::has('evaluations')->count();
        $totalEvaluations = \App\Models\Evaluation::count();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalTccs' => $totalTccs,
                'totalProfessors' => $totalProfessors,
                'evaluatedTccs' => $evaluatedTccs,
                'totalEvaluations' => $totalEvaluations,
            ]
        ]);
    }

    public function tccs(Request $request)
    {
        $query = Tcc::with(['evaluations.user', 'orientador', 'evaluators']);

        if ($request->filled('period')) {
            $query->where('period', $request->period);
        }

        $tccs = $query->get()->map(function ($tcc) {
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
                'period' => $tcc->period,
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

        $availablePeriods = Tcc::whereNotNull('period')->distinct()->pluck('period')->filter()->values();

        return Inertia::render('Admin/Tccs', [
            'tccs' => $tccs,
            'availablePeriods' => $availablePeriods,
            'filters' => [
                'period' => $request->period,
            ]
        ]);
    }

    public function professors()
    {
        $professors = \App\Models\User::where('role', 'professor')
            ->select('id', 'name', 'temp_password', 'access_token')
            ->get();

        return Inertia::render('Admin/Professors', [
            'professors' => $professors,
        ]);
    }

    public function storeProfessor(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $email = strtolower(\Illuminate\Support\Str::slug($request->name, '.')) . '@example.com';
        $tempPassword = \Illuminate\Support\Str::random(8);

        \App\Models\User::create([
            'name' => $request->name,
            'email' => $email,
            'password' => bcrypt($tempPassword),
            'temp_password' => $tempPassword,
            'role' => 'professor',
        ]);

        return redirect()->back()->with('success', 'Professor cadastrado com sucesso!');
    }

    public function updateProfessor(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $professor = \App\Models\User::findOrFail($id);
        
        // If name changed, we could update the email, but it's better to keep it stable.
        // We'll just update the name.
        $professor->update([
            'name' => $request->name,
        ]);

        return redirect()->back()->with('success', 'Professor atualizado com sucesso!');
    }

    public function destroyProfessor($id)
    {
        $professor = \App\Models\User::findOrFail($id);
        
        // Check if professor is an orientador or evaluator
        $isOrientador = \App\Models\Tcc::where('orientador_id', $professor->id)->exists();
        $isEvaluator = \DB::table('tcc_evaluator')->where('user_id', $professor->id)->exists();

        if ($isOrientador || $isEvaluator) {
            return redirect()->back()->with('error', 'Não é possível excluir este professor pois ele está vinculado a um ou mais TCCs.');
        }

        $professor->delete();

        return redirect()->back()->with('success', 'Professor removido com sucesso!');
    }

    public function showImport()
    {
        $availablePeriods = \App\Models\Tcc::whereNotNull('period')->distinct()->pluck('period')->filter()->values();
        return Inertia::render('Admin/Import', [
            'availablePeriods' => $availablePeriods
        ]);
    }

    public function import(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt',
            'period' => 'required|string|max:20', // e.g. "2026.1"
        ]);

        $period = $request->input('period');
        $file = $request->file('csv_file');
        $lines = file($file->getRealPath());
        
        // Load all professors into memory once to do fast, accent-insensitive matching
        $allProfessors = \App\Models\User::where('role', 'professor')->get();
        
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
            
            $tccIdOriginal = trim($row[0]);
            $title = trim($row[1]);
            $student = trim($row[2]);
            $orientadorName = trim($row[3]);
            $avaliadoresString = trim($row[4]);
            $location = trim($row[5]);
            $dateTime = trim($row[6]);

            // Para evitar que TCCs diferentes (de semestres ou turmas diferentes) que usem o mesmo ID no CSV (ex: "TCC01")
            // se sobrescrevam, criamos um ID único no banco unindo o ID original, o nome do aluno e o período.
            // Ex: "TCC01-joao-silva-2026-1"
            $studentSlug = \Illuminate\Support\Str::slug($student);
            $periodSlug = \Illuminate\Support\Str::slug($period);
            // Pega os primeiros 15 caracteres do slug do aluno para não ficar um ID gigante
            $tccId = $tccIdOriginal . '-' . substr($studentSlug, 0, 15) . '-' . $periodSlug;

            
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
            
            // Find or create orientador using smart accent/case insensitive match
            $orientador = $this->findProfessorMatch($orientadorName, $allProfessors);
                
            if (!$orientador) {
                $email = strtolower(\Illuminate\Support\Str::slug($orientadorName, '.')) . '@example.com';
                $tempPassword = \Illuminate\Support\Str::random(8);
                
                $orientador = \App\Models\User::create([
                    'name' => $orientadorName,
                    'email' => $email,
                    'password' => bcrypt($tempPassword),
                    'temp_password' => $tempPassword,
                    'role' => 'professor',
                ]);
                $allProfessors->push($orientador);
            }
            
            // Create or update TCC
            $tcc = Tcc::updateOrCreate(
                ['id' => $tccId],
                [
                    'title' => $title,
                    'student' => $student,
                    'location' => $location,
                    'period' => $period,
                    'orientador_id' => $orientador->id,
                    'defense_date' => $defenseDate,
                    'defense_time' => $defenseTime,
                ]
            );
            
            // Associate avaliadores (evaluators)
            if (!empty($avaliadoresString)) {
                $this->associateEvaluators($tcc, $avaliadoresString, $allProfessors);
            }
        }

        return redirect()->back()->with('success', 'TCCs importados com sucesso!');
    }

    private function findProfessorMatch($name, $allProfessors)
    {
        $cleanName = preg_replace('/^(Prof\.|Profa\.|Dr\.|Dra\.|Me\.|Ma\.)\s*/i', '', trim($name));
        $searchSlug = \Illuminate\Support\Str::slug($cleanName);

        if (empty($searchSlug)) return null;

        // 1. Tenta correspondência exata de slug (ignora acento e case)
        foreach ($allProfessors as $prof) {
            if (\Illuminate\Support\Str::slug($prof->name) === $searchSlug) {
                return $prof;
            }
        }

        // 2. Correspondência parcial
        foreach ($allProfessors as $prof) {
            $profSlug = \Illuminate\Support\Str::slug($prof->name);
            if (str_contains($profSlug, $searchSlug) || str_contains($searchSlug, $profSlug)) {
                return $prof;
            }
        }

        return null;
    }

    private function associateEvaluators($tcc, $avaliadoresString, $allProfessors)
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
            
            // Find evaluator by name using smart match
            $evaluator = $this->findProfessorMatch($name, $allProfessors);
            
            // If evaluator doesn't exist, create them
            if (!$evaluator) {
                $email = strtolower(\Illuminate\Support\Str::slug($name, '.')) . '@example.com';
                $tempPassword = \Illuminate\Support\Str::random(8);
                
                $evaluator = \App\Models\User::create([
                    'name' => $name,
                    'email' => $email,
                    'password' => bcrypt($tempPassword),
                    'temp_password' => $tempPassword,
                    'role' => 'professor',
                ]);
                $allProfessors->push($evaluator);
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
        // Explicitly for SQLite
        if (\DB::getDriverName() == 'sqlite') {
            \DB::statement('PRAGMA foreign_keys = OFF;');
        }
        
        // No try-catch: if it fails, we want to see the 500 error page detailed message
        \DB::transaction(function () {
            // 1. Delete Evaluations
            \App\Models\Evaluation::query()->delete();
            
            // 2. Clear relationships
            \DB::table('tcc_evaluator')->delete();
            // \DB::table('project_user')->delete(); // Likely linked to Project model which is invalid
            
            // 3. Delete TCCs
            \App\Models\Tcc::query()->delete();
            // \App\Models\Project::query()->delete(); // Removed: table likely doesn't exist
            
            // 4. Delete Users (Except Admin)
            \App\Models\User::where('role', '!=', 'admin')->delete();

            // Reset Auto Increment if possible (SQLite specific)
            if (\DB::getDriverName() == 'sqlite') {
                \DB::statement("DELETE FROM sqlite_sequence WHERE name IN ('evaluations', 'tccs', 'users')");
            }
        });

        if (\DB::getDriverName() == 'sqlite') {
            \DB::statement('PRAGMA foreign_keys = ON;');
        }

        return redirect()->route('admin.dashboard')->with('success', 'Banco de dados resetado com sucesso! Apenas o usuário Admin foi mantido.');
    }
}
