import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    ArrowLeft,
    Award,
    TrendingUp,
    Star,
    CheckCircle2,
    Eye
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

declare global {
    var route: (name: string, params?: any, absolute?: boolean) => string;
}

interface ProfessorGrade {
    professor: string;
    etapa1_grade: number | null;
    etapa2_grade: number | null;
    final_grade: number | null;
}

interface Tcc {
    id: string;
    title: string;
    student: string;
    orientador: string;
    location: string;
    defense_date: string | null;
    defense_time: string | null;
    etapa1_average: number;
    etapa2_average: number;
    final_average: number | null;
    professor_grades: ProfessorGrade[];
    evaluators: string[];
}

export default function EvaluatedTccs({ tccs }: { tccs: Tcc[] }) {
    // Calcular estatísticas
    const totalEvaluated = tccs.length;
    const completedTccs = tccs.filter(t => t.final_average !== null);
    const averageOfAverages = completedTccs.length > 0
        ? (completedTccs.reduce((sum, t) => sum + (t.final_average ?? 0), 0) / completedTccs.length).toFixed(2)
        : '0.00';
    const highestGrade = completedTccs.length > 0
        ? Math.max(...completedTccs.map(t => t.final_average ?? 0)).toFixed(2)
        : '0.00';
    const topTccs = completedTccs.filter(t => (t.final_average ?? 0) >= 8).length;

    // TCC selecionado para exibir detalhes
    const [selectedTccId, setSelectedTccId] = useState<string | null>(
        tccs.length > 0 ? tccs[0].id : null
    );

    const selectedTcc = tccs.find(t => t.id === selectedTccId) || null;

    // Função para determinar a cor da nota
    const getGradeColor = (grade: number) => {
        if (grade >= 9) return 'bg-green-100 text-green-800';
        if (grade >= 7) return 'bg-blue-100 text-blue-800';
        if (grade >= 5) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: route('admin.dashboard') },
            { title: 'TCCs Avaliados', href: route('admin.evaluated_tccs') }
        ]}>
            <Head title="TCCs Avaliados" />

            <div className="flex flex-col gap-6 p-4 md:p-8 pt-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">TCCs Avaliados</h1>
                        <p className="text-sm text-gray-500 mt-1">Visualize as médias das avaliações dos TCCs</p>
                    </div>
                </div>
                {/* Cards de Estatísticas */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <Card className="shadow-xl border-0 bg-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Avaliados</CardTitle>
                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-900">{totalEvaluated}</div>
                            <p className="text-xs text-gray-500 mt-1">
                                TCCs com avaliação
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xl border-0 bg-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Média Geral</CardTitle>
                            <TrendingUp className="h-5 w-5 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-900">{averageOfAverages}</div>
                            <p className="text-xs text-gray-500 mt-1">
                                Média de todas as notas finais
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xl border-0 bg-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Maior Nota</CardTitle>
                            <Award className="h-5 w-5 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-900">{highestGrade}</div>
                            <p className="text-xs text-gray-500 mt-1">
                                Melhor desempenho
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xl border-0 bg-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">TCCs Destaque</CardTitle>
                            <Star className="h-5 w-5 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-900">{topTccs}</div>
                            <p className="text-xs text-gray-500 mt-1">
                                Nota Final ≥ 8.0
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Lista de TCCs + detalhes do selecionado */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Coluna de lista */}
                    <Card className="shadow-xl border-0 bg-white lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-xl text-gray-900">TCCs Avaliados</CardTitle>
                            <CardDescription className="mt-1">
                                Selecione um TCC para ver os detalhes das avaliações
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {tccs.length > 0 ? (
                                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                                    {tccs.map((tcc) => {
                                        const isSelected = tcc.id === selectedTccId;
                                        return (
                                            <button
                                                key={tcc.id}
                                                type="button"
                                                onClick={() => setSelectedTccId(tcc.id)}
                                                className={`w-full text-left rounded-xl border px-4 py-3 transition ${
                                                    isSelected
                                                        ? 'border-gray-900 bg-gray-900 text-white shadow-lg'
                                                        : 'border-gray-200 bg-white text-gray-900 shadow-sm'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <div className="text-sm font-semibold line-clamp-2">
                                                            {tcc.title}
                                                        </div>
                                                        <div className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                            tcc.final_average !== null && tcc.final_average >= 8
                                                                ? 'bg-purple-100 text-purple-800'
                                                                : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                            {tcc.final_average !== null
                                                                ? <>Nota Final: {tcc.final_average.toFixed(2)}</>
                                                                : <>Nota Final: Pendente</>
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`mt-2 flex flex-wrap gap-2 text-xs ${
                                                    isSelected ? 'text-gray-100' : 'text-gray-600'
                                                }`}>
                                                    <span>Aluno: <span className="font-semibold">{tcc.student}</span></span>
                                                    <span className="hidden sm:inline">•</span>
                                                    <span>Orientador: <span className="font-semibold">{tcc.orientador}</span></span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">Nenhum TCC avaliado</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Coluna de detalhes */}
                    <Card className="shadow-xl border-0 bg-white lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-xl text-gray-900">Detalhes das Avaliações</CardTitle>
                            <CardDescription className="mt-1">
                                Visualize as notas por avaliador e por etapa do TCC selecionado
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {selectedTcc ? (
                                <>
                                    <div className="mb-4">
                                        <h2 className="text-lg font-semibold text-gray-900">{selectedTcc.title}</h2>
                                        <p className="mt-1 text-sm text-gray-600">
                                            Aluno: <span className="font-semibold">{selectedTcc.student}</span> | Orientador: <span className="font-semibold">{selectedTcc.orientador}</span> | Local: {selectedTcc.location} | Data/Horário: {selectedTcc.defense_date} {selectedTcc.defense_time}
                                        </p>
                                        <div className="mt-3 flex flex-wrap gap-3 text-sm">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-900 text-white font-semibold">
                                                Nota Final Geral: {selectedTcc.final_average !== null ? selectedTcc.final_average.toFixed(2) : 'Pendente'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left text-gray-700">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Avaliador</th>
                                                    <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Etapa 1</th>
                                                    <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Etapa 2</th>
                                                    <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nota Final Individual</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {selectedTcc.professor_grades && selectedTcc.professor_grades.length > 0 ? (
                                                    selectedTcc.professor_grades.map((pg, idx) => (
                                                        <tr
                                                            key={idx}
                                                            className="transition-colors hover:bg-gray-50"
                                                        >
                                                            <td className="px-4 py-2 text-sm text-gray-900 font-medium whitespace-nowrap">{pg.professor}</td>
                                                            <td className="px-4 py-2 text-sm font-semibold">
                                                                {pg.etapa1_grade !== null ? (
                                                                    <span className={`inline-block px-2 py-1 rounded ${getGradeColor(pg.etapa1_grade)}`}>
                                                                        {pg.etapa1_grade.toFixed(2)}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-gray-400 italic">-</span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm font-semibold">
                                                                {pg.etapa2_grade !== null ? (
                                                                    <span className={`inline-block px-2 py-1 rounded ${getGradeColor(pg.etapa2_grade)}`}>
                                                                        {pg.etapa2_grade.toFixed(2)}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-gray-400 italic">-</span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm font-bold">
                                                                {pg.final_grade !== null ? (
                                                                    <span className={`inline-block px-2 py-1 rounded ${getGradeColor(pg.final_grade)}`}>
                                                                        {pg.final_grade.toFixed(2)}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-gray-400 italic">-</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">Nenhuma avaliação registrada</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12 text-gray-500">Selecione um TCC na lista ao lado</div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Legenda de Cores */}
                {tccs.length > 0 && (
                    <Card className="shadow-xl border-0 bg-white mt-6">
                        <CardHeader>
                            <CardTitle className="text-sm text-gray-900">Legenda de Notas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="inline-block w-4 h-4 rounded bg-green-100 border-2 border-green-800"></span>
                                    <span className="text-sm text-gray-600">Excelente (9.0 - 10.0)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="inline-block w-4 h-4 rounded bg-blue-100 border-2 border-blue-800"></span>
                                    <span className="text-sm text-gray-600">Bom (7.0 - 8.9)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="inline-block w-4 h-4 rounded bg-yellow-100 border-2 border-yellow-800"></span>
                                    <span className="text-sm text-gray-600">Regular (5.0 - 6.9)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="inline-block w-4 h-4 rounded bg-red-100 border-2 border-red-800"></span>
                                    <span className="text-sm text-gray-600">
                                        Insuficiente ({'< 5.0'})
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
