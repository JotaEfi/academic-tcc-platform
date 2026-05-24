<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Tcc;
use App\Models\Evaluation;
use Illuminate\Support\Str;
use Carbon\Carbon;

class TccEvaluationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Ensure Admin User exists
        $admin = User::where('email', 'admin@example.com')->first();
        if (!$admin) {
            User::create([
                'name' => 'Administrador da FAP',
                'email' => 'admin@example.com',
                'password' => bcrypt('password'),
                'role' => 'admin',
            ]);
        }

        // 2. Create sample professors
        $professorsData = [
            ['name' => 'Prof. Dr. Ricardo Silva', 'email' => 'ricardo.silva@example.com'],
            ['name' => 'Profa. Dra. Elaine Souza', 'email' => 'elaine.souza@example.com'],
            ['name' => 'Prof. Me. Carlos Santos', 'email' => 'carlos.santos@example.com'],
            ['name' => 'Profa. Ma. Patrícia Costa', 'email' => 'patricia.costa@example.com'],
            ['name' => 'Prof. Dr. Marcos Oliveira', 'email' => 'marcos.oliveira@example.com'],
            ['name' => 'Profa. Dra. Ana Carolina', 'email' => 'ana.carolina@example.com'],
            ['name' => 'Prof. Dr. Felipe Mendes', 'email' => 'felipe.mendes@example.com'],
            ['name' => 'Profa. Ma. Letícia Barros', 'email' => 'leticia.barros@example.com']
        ];

        $professors = collect();
        foreach ($professorsData as $data) {
            $prof = User::where('email', $data['email'])->first();
            if (!$prof) {
                $tempPass = Str::random(8);
                $prof = User::create([
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'password' => bcrypt('password'), // Simple password for local dev
                    'temp_password' => $tempPass,
                    'role' => 'professor',
                ]);
            }
            $professors->push($prof);
        }

        // 3. Define Periods and TCC details
        $periods = ['2025.1', '2025.2', '2026.1'];
        
        $tccsData = [
            // 2025.1
            [
                'title' => 'Análise Comparativa de Algoritmos de Machine Learning na Detecção de Fraudes Financeiras',
                'student' => 'João Gabriel Ferreira',
                'period' => '2025.1',
                'location' => 'Auditório de Computação',
                'days_ago' => 365,
                'time' => '14:00 às 14:50',
                'incomplete' => false
            ],
            [
                'title' => 'Desenvolvimento de um Sistema IoT de Baixo Custo para Monitoramento de Umidade de Solo Agrícola',
                'student' => 'Mariana R. Medeiros',
                'period' => '2025.1',
                'location' => 'Laboratório de Redes',
                'days_ago' => 364,
                'time' => '15:00 às 15:50',
                'incomplete' => false
            ],
            [
                'title' => 'Aplicação de Visão Computacional para Classificação de Defeitos em Linhas de Produção Industriais',
                'student' => 'Pedro Henrique Costa',
                'period' => '2025.1',
                'location' => 'Sala de Reuniões 02',
                'days_ago' => 363,
                'time' => '16:00 às 16:50',
                'incomplete' => false
            ],

            // 2025.2
            [
                'title' => 'Implementação de Arquitetura Serverless para Otimização de Custos em Startups de Tecnologia',
                'student' => 'Lucas Vinícius Santos',
                'period' => '2025.2',
                'location' => 'Auditório de Computação',
                'days_ago' => 180,
                'time' => '09:00 às 09:50',
                'incomplete' => false
            ],
            [
                'title' => 'Impacto da LGPD no Desenvolvimento de Software no Setor de Saúde do Amapá',
                'student' => 'Ana Beatriz de Souza',
                'period' => '2025.2',
                'location' => 'Sala de Reuniões 01',
                'days_ago' => 179,
                'time' => '10:00 às 10:50',
                'incomplete' => false
            ],
            [
                'title' => 'Uso de Redes Neurais Convolucionais na Detecção Precoce de Pragas em Plantações de Açaí',
                'student' => 'Thiago Silva Ramos',
                'period' => '2025.2',
                'location' => 'Laboratório 2B',
                'days_ago' => 178,
                'time' => '11:00 às 11:50',
                'incomplete' => true // Uma banca incompleta
            ],

            // 2026.1
            [
                'title' => 'Desenvolvimento de uma Plataforma de Apoio Acadêmico Baseada em Microsserviços e React',
                'student' => 'Clara Machado Pinheiro',
                'period' => '2026.1',
                'location' => 'Laboratório 2B',
                'days_ago' => 10,
                'time' => '14:00 às 14:50',
                'incomplete' => false
            ],
            [
                'title' => 'Uma Abordagem Baseada em Blockchain para Rastreabilidade da Cadeia Produtiva da Castanha',
                'student' => 'Felipe Augusto Rocha',
                'period' => '2026.1',
                'location' => 'Auditório de Computação',
                'days_ago' => 9,
                'time' => '15:00 às 15:50',
                'incomplete' => false
            ],
            [
                'title' => 'Estudo da Acessibilidade em Aplicativos Móveis Públicos sob a Ótica da WCAG',
                'student' => 'Sarah Regina Lima',
                'period' => '2026.1',
                'location' => 'Sala de Reuniões 01',
                'days_ago' => 8,
                'time' => '16:00 às 16:50',
                'incomplete' => true // Banca com notas parciais (alguns professores pendentes)
            ],
            [
                'title' => 'Migração de Bancos de Dados Legados para Soluções Multi-Cloud: Um Estudo de Caso Prático',
                'student' => 'Rodrigo Souza Cruz',
                'period' => '2026.1',
                'location' => 'Laboratório de Redes',
                'days_ago' => 5,
                'time' => '09:00 às 09:50',
                'incomplete' => false
            ]
        ];

        foreach ($tccsData as $index => $tccData) {
            $studentSlug = Str::slug($tccData['student']);
            $periodSlug = Str::slug($tccData['period']);
            $tccIdOriginal = 'TCC' . sprintf('%02d', $index + 1);
            $tccId = $tccIdOriginal . '-' . substr($studentSlug, 0, 15) . '-' . $periodSlug;

            // Select random orientador and 2 unique evaluators
            $shuffledProfs = $professors->shuffle();
            $orientador = $shuffledProfs->get(0);
            $evaluator1 = $shuffledProfs->get(1);
            $evaluator2 = $shuffledProfs->get(2);

            $defenseDate = Carbon::now()->subDays($tccData['days_ago'])->format('Y-m-d');

            // 4. Create Tcc
            $tcc = Tcc::updateOrCreate(
                ['id' => $tccId],
                [
                    'title' => $tccData['title'],
                    'student' => $tccData['student'],
                    'location' => $tccData['location'],
                    'period' => $tccData['period'],
                    'orientador_id' => $orientador->id,
                    'defense_date' => $defenseDate,
                    'defense_time' => $tccData['time'],
                ]
            );

            // Associate evaluators
            $tcc->evaluators()->sync([$evaluator1->id, $evaluator2->id]);

            // 5. Generate evaluations
            // All members of the panel evaluate (orientador + 2 evaluators)
            $panel = collect([$orientador, $evaluator1, $evaluator2]);

            foreach ($panel as $memberIdx => $member) {
                // If it's marked as incomplete and we are on the incomplete members list, skip some grades
                if ($tccData['incomplete'] && $memberIdx === 2) {
                    continue; // Skip evaluations of the third member entirely to leave it incomplete
                }

                // Generates Etapa 1 Evaluation
                // Criteria A1 to A9: 9 scores (typical values between 6.5 and 10.0)
                $etapa1Scores = [];
                for ($i = 0; $i < 9; $i++) {
                    $etapa1Scores[] = rand(70, 100) / 10.0;
                }

                // If incomplete evaluation, maybe only stage 1 is evaluated
                if ($tccData['incomplete'] && $memberIdx === 1) {
                    Evaluation::updateOrCreate(
                        [
                            'tcc_id' => $tcc->id,
                            'user_id' => $member->id,
                            'stage' => 'etapa1'
                        ],
                        [
                            'scores' => $etapa1Scores
                        ]
                    );
                    continue; // Skip Stage 2 for this evaluator to leave it incomplete
                }

                Evaluation::updateOrCreate(
                    [
                        'tcc_id' => $tcc->id,
                        'user_id' => $member->id,
                        'stage' => 'etapa1'
                    ],
                    [
                        'scores' => $etapa1Scores
                    ]
                );

                // Generates Etapa 2 Evaluation
                // Criteria B1 to B5: 5 scores (typical values between 7.0 and 10.0)
                $etapa2Scores = [];
                for ($i = 0; $i < 5; $i++) {
                    $etapa2Scores[] = rand(75, 100) / 10.0;
                }

                Evaluation::updateOrCreate(
                    [
                        'tcc_id' => $tcc->id,
                        'user_id' => $member->id,
                        'stage' => 'etapa2'
                    ],
                    [
                        'scores' => $etapa2Scores
                    ]
                );
            }
        }
    }
}
