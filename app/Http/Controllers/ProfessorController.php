<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Tcc;
use App\Models\Evaluation;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class ProfessorController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Get TCCs onde o professor é avaliador
        $tccsAsEvaluator = $user->tccsAsEvaluator()->with(['evaluations' => function($q) use ($user) {
            $q->where('user_id', $user->id);
        }, 'orientador'])->get();
        
        // Get TCCs onde o professor é orientador
        $tccsAsOrientador = $user->tccsAsOrientador()->with(['evaluations' => function($q) use ($user) {
            $q->where('user_id', $user->id);
        }, 'orientador'])->get();
        
        // Merge collections ensuring unique TCCs (in case someone is both, though unlikely)
        $allTccs = $tccsAsEvaluator->merge($tccsAsOrientador)->unique('id');
        
        // Map and format
        $tccs = $allTccs->map(function($tcc) use ($user) {
            $etapa1 = $tcc->evaluations->where('stage', 'etapa1')->first();
            $etapa2 = $tcc->evaluations->where('stage', 'etapa2')->first();
            
            $isOrientador = $tcc->orientador_id === $user->id;

            return [
                'id' => $tcc->id,
                'title' => $tcc->title,
                'student' => $tcc->student,
                'orientador' => $tcc->orientador ? $tcc->orientador->name : 'N/A',
                'location' => $tcc->location,
                'defense_date' => $tcc->defense_date ? $tcc->defense_date->format('d/m/Y') : null,
                'defense_time' => $tcc->defense_time,
                'etapa1_completed' => $etapa1 !== null,
                'etapa2_completed' => $etapa2 !== null,
                'role' => $isOrientador ? 'orientador' : 'evaluator',
            ];
        });

        return Inertia::render('Professor/Dashboard', [
            'tccs' => $tccs->values(), // Reset keys after unique
        ]);
    }

    public function show($id, Request $request)
    {
        $tcc = Tcc::with('orientador')->findOrFail($id);
        $stage = $request->query('stage', 'etapa1'); // Default to etapa1
        $user = Auth::user();
        
        // Check if professor is assigned to this TCC (as evaluator OR orientador)
        $isEvaluator = $user->tccsAsEvaluator->contains($id);
        $isOrientador = $tcc->orientador_id === $user->id;

        if (!$isEvaluator && !$isOrientador) {
            abort(403, 'You are not assigned to evaluate this TCC');
        }
        
        // Check if already evaluated this stage
        $existingEvaluation = Evaluation::where('tcc_id', $id)
            ->where('user_id', Auth::id())
            ->where('stage', $stage)
            ->first();
        
        return Inertia::render('Professor/Evaluation', [
            'tcc' => $tcc,
            'stage' => $stage,
            'existingEvaluation' => $existingEvaluation,
        ]);
    }

    public function store(Request $request, $id)
    {
        $request->validate([
            'stage' => ['required', 'in:etapa1,etapa2'],
            'scores' => ['required', 'array', function ($attribute, $value, $fail) use ($request) {
                $expectedSize = $request->stage === 'etapa1' ? 9 : 5;
                if (count($value) !== $expectedSize) {
                    $fail("A etapa {$request->stage} requer {$expectedSize} notas.");
                }
            }],
            'scores.*' => ['required', 'numeric', 'min:0', 'max:5'],
        ]);

        $tcc = Tcc::findOrFail($id);
        $user = Auth::user();
        
        // Check if professor is assigned to this TCC (as evaluator OR orientador)
        $isEvaluator = $user->tccsAsEvaluator->contains($id);
        $isOrientador = $tcc->orientador_id === $user->id;

        if (!$isEvaluator && !$isOrientador) {
            abort(403, 'You are not assigned to evaluate this TCC');
        }

        Evaluation::updateOrCreate(
            [
                'tcc_id' => $id,
                'user_id' => Auth::id(),
                'stage' => $request->stage,
            ],
            [
                'scores' => $request->scores,
            ]
        );

        return redirect()->route('professor.dashboard')->with('success', 'Avaliação salva com sucesso!');
    }
}
