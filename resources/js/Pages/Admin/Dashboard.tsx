import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  FolderOpen,
  CheckCircle2,
  BarChart3,
  Download
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

declare global {
  var route: (name: string, params?: any, absolute?: boolean) => string;
}

interface Stats {
  totalTccs: number;
  totalProfessors: number;
  evaluatedTccs: number;
  totalEvaluations: number;
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

export default function AdminDashboard({ stats, tccs }: { stats: Stats, tccs: Tcc[] }) {
  const { totalTccs, totalProfessors, evaluatedTccs, totalEvaluations } = stats;

  const [selectedTccId, setSelectedTccId] = useState<string | null>(
      tccs && tccs.length > 0 ? tccs[0].id : null
  );

  const selectedTcc = tccs?.find(t => t.id === selectedTccId) || null;

  const getGradeColor = (grade: number) => {
      if (grade >= 9) return 'bg-green-100 text-green-800';
      if (grade >= 7) return 'bg-blue-100 text-blue-800';
      if (grade >= 5) return 'bg-yellow-100 text-yellow-800';
      return 'bg-red-100 text-red-800';
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Dashboard', href: route('admin.dashboard') }]}>
      <Head title="Admin Dashboard" />

      <div className="flex flex-col gap-6 p-4 md:p-8 pt-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard Administrativo</h1>
            <p className="text-sm text-gray-500 mt-1">Visão geral do sistema e resultados das avaliações</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => window.location.href = route('admin.export')}
              className="flex items-center gap-2 bg-[#216f7d] hover:bg-[#1a5b67] text-white"
            >
              <Download className="w-4 h-4" />
              Exportar CSV de Resultados
            </Button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-xl border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de TCCs</CardTitle>
              <FolderOpen className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalTccs}</div>
              <p className="text-xs text-gray-500 mt-1">
                TCCs cadastrados no sistema
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Professores</CardTitle>
              <Users className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalProfessors}</div>
              <p className="text-xs text-gray-500 mt-1">
                Avaliadores cadastrados
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avaliações Feitas</CardTitle>
              <BarChart3 className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalEvaluations}</div>
              <p className="text-xs text-gray-500 mt-1">
                Fichas preenchidas
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Projetos Avaliados</CardTitle>
              <CheckCircle2 className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{evaluatedTccs}</div>
              <p className="text-xs text-gray-500 mt-1">
                de {totalTccs} TCCs receberam nota
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de TCCs + detalhes do selecionado */}
        <div className="grid gap-6 lg:grid-cols-3 mt-2">
            {/* Coluna de lista */}
            <Card className="shadow-xl border-0 bg-white lg:col-span-1">
                <CardHeader>
                    <CardTitle className="text-xl text-gray-900">TCCs Avaliados</CardTitle>
                    <CardDescription className="mt-1">
                        Selecione um TCC para ver detalhes
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {tccs && tccs.length > 0 ? (
                        <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
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
                                                : 'border-gray-200 bg-white text-gray-900 shadow-sm hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <div className="text-sm font-semibold line-clamp-2">
                                                    {tcc.title}
                                                </div>
                                                <div className={`mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                                                    tcc.final_average !== null && tcc.final_average >= 8
                                                        ? (isSelected ? 'bg-purple-800 text-purple-100' : 'bg-purple-100 text-purple-800')
                                                        : (isSelected ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-700')
                                                }`}>
                                                    {tcc.final_average !== null
                                                        ? <>Nota Final: {tcc.final_average.toFixed(2)}</>
                                                        : <>Pendente</>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`mt-2 flex flex-wrap gap-2 text-xs ${
                                            isSelected ? 'text-gray-300' : 'text-gray-500'
                                        }`}>
                                            <span>Aluno: <span className="font-semibold">{tcc.student}</span></span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">Nenhum TCC avaliado ainda.</div>
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
                            <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900">{selectedTcc.title}</h2>
                                <p className="mt-2 text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-2">
                                    <span><strong>Aluno:</strong> {selectedTcc.student}</span>
                                    <span><strong>Orientador:</strong> {selectedTcc.orientador}</span>
                                    <span><strong>Local:</strong> {selectedTcc.location}</span>
                                </p>
                                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                                    <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-gray-900 text-white font-bold shadow-sm tracking-wide">
                                        Nota Final Geral: {selectedTcc.final_average !== null ? selectedTcc.final_average.toFixed(2) : 'Pendente'}
                                    </span>
                                </div>
                            </div>

                            <div className="overflow-x-auto border border-gray-200 rounded-xl">
                                <table className="w-full text-sm text-left text-gray-700">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Avaliador</th>
                                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Etapa 1</th>
                                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Etapa 2</th>
                                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide text-right">Média Final</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {selectedTcc.professor_grades && selectedTcc.professor_grades.length > 0 ? (
                                            selectedTcc.professor_grades.map((pg, idx) => (
                                                <tr key={idx} className="transition-colors hover:bg-gray-50/80">
                                                    <td className="px-4 py-4 text-sm text-gray-900 font-medium whitespace-nowrap">{pg.professor}</td>
                                                    <td className="px-4 py-4 text-sm font-semibold">
                                                        {pg.etapa1_grade !== null ? (
                                                            <span className={`inline-block px-2 py-1 rounded-md shadow-sm border border-transparent ${getGradeColor(pg.etapa1_grade)}`}>
                                                                {pg.etapa1_grade.toFixed(2)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400 italic font-normal">Pendente</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm font-semibold">
                                                        {pg.etapa2_grade !== null ? (
                                                            <span className={`inline-block px-2 py-1 rounded-md shadow-sm border border-transparent ${getGradeColor(pg.etapa2_grade)}`}>
                                                                {pg.etapa2_grade.toFixed(2)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400 italic font-normal">Pendente</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm font-bold text-right">
                                                        {pg.final_grade !== null ? (
                                                            <span className={`inline-block px-2 py-1 rounded-md shadow-sm border border-transparent ${getGradeColor(pg.final_grade)}`}>
                                                                {pg.final_grade.toFixed(2)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400 italic font-normal">Pendente</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-12 text-center text-gray-400 text-sm">Nenhuma avaliação foi preenchida para esta banca ainda.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-20">
                            <CheckCircle2 className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">Nenhum TCC selecionado</h3>
                            <p className="text-gray-500 mt-1">Clique em um TCC na lista à esquerda para detalhar as notas da banca.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

      </div>
    </AppLayout>
  );
}