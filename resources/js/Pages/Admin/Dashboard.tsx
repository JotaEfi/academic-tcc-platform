import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  FolderOpen,
  CheckCircle2,
  BarChart3,
  Download,
  Search,
  User,
  ChevronRight,
  Eye,
  Sparkles
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

interface Tcc {
  id: string;
  title: string;
  student: string;
  period: string;
  orientador: string;
  location: string;
  defense_date: string | null;
  defense_time: string | null;
  etapa1_average: number;
  etapa2_average: number;
  final_average: number | null;
}

interface Props {
  stats: Stats;
  tccs: Tcc[];
  availablePeriods: string[];
  filters: {
    period: string | null;
  };
}

export default function AdminDashboard({ stats, tccs = [], availablePeriods = [], filters = { period: null } }: Props) {
  const { totalTccs, totalProfessors, evaluatedTccs, totalEvaluations } = stats;
  const [searchTerm, setSearchTerm] = useState('');

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const period = e.target.value;
    router.get(
      route('admin.dashboard'),
      period ? { period } : {},
      { preserveState: true, preserveScroll: true }
    );
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 9) return 'bg-emerald-50/60 text-emerald-800 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
    if (grade >= 7) return 'bg-sky-50/60 text-sky-800 border-sky-100 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30';
    if (grade >= 5) return 'bg-amber-50/60 text-amber-800 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
    return 'bg-rose-50/60 text-rose-800 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30';
  };

  const filteredTccs = tccs.filter(t => 
    t.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout breadcrumbs={[{ title: 'Dashboard', href: route('admin.dashboard') }]}>
      <Head title="Admin Dashboard" />

      <div className="flex flex-col gap-5 p-4 md:p-6 pt-0 max-w-7xl mx-auto w-full">
        {/* Unified Minimal Header Block */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              Painel do Administrador
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Estatísticas gerais e resumo de bancas.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 lg:max-w-3xl lg:justify-end">
            {/* Period select */}
            <div className="flex items-center gap-2 min-w-[200px]">
              <select
                id="periodFilter"
                value={filters.period || ''}
                onChange={handlePeriodChange}
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-white text-xs rounded-lg focus:ring-[#216f7d] focus:border-[#216f7d] py-1.5 px-2.5 font-medium transition-all"
              >
                <option value="">Todos os Períodos</option>
                {availablePeriods.map(period => (
                  <option key={period} value={period}>{period}</option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar estudante ou trabalho..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus-visible:ring-[#216f7d]"
              />
            </div>

            {/* Download/Export button */}
            <Button
              onClick={() => window.location.href = route('admin.export')}
              className="h-8 text-xs bg-[#216f7d] hover:bg-[#164e58] text-white px-3 gap-1.5 rounded-lg shrink-0 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Planilha Geral
            </Button>
          </div>
        </div>

        {/* Minimalist Stats Strip */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl p-3 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block">Total de TCCs</span>
              <span className="text-lg font-extrabold text-gray-900 dark:text-white mt-0.5 block">{totalTccs}</span>
            </div>
            <FolderOpen className="h-4 w-4 text-blue-400 shrink-0" />
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl p-3 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block">Professores</span>
              <span className="text-lg font-extrabold text-gray-900 dark:text-white mt-0.5 block">{totalProfessors}</span>
            </div>
            <Users className="h-4 w-4 text-purple-400 shrink-0" />
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl p-3 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block">Avaliações</span>
              <span className="text-lg font-extrabold text-gray-900 dark:text-white mt-0.5 block">{totalEvaluations}</span>
            </div>
            <BarChart3 className="h-4 w-4 text-sky-400 shrink-0" />
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl p-3 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block">TCCs Avaliados</span>
              <span className="text-lg font-extrabold text-gray-900 dark:text-white mt-0.5 block">{evaluatedTccs}</span>
            </div>
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          </div>
        </div>

        {/* Simplified Grade List Card */}
        <Card className="shadow-sm border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden">
          <div className="border-b border-gray-100 dark:border-zinc-800/60 py-3.5 px-5 flex items-center justify-between bg-gray-50/30 dark:bg-zinc-900/20">
            <div>
              <h2 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Notas e Médias das Bancas</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.get(route('admin.results'))}
              className="h-7 text-xs border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
            >
              Fichas Completas
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Button>
          </div>
          
          <CardContent className="p-0">
            {filteredTccs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-gray-700 dark:text-gray-300">
                  <thead className="bg-gray-50/50 dark:bg-zinc-800/40 border-b border-gray-100 dark:border-zinc-800 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3">Estudante</th>
                      <th className="px-5 py-3">Trabalho de Conclusão (TCC)</th>
                      <th className="px-5 py-3 text-center">Período</th>
                      <th className="px-5 py-3 text-center">Média Final</th>
                      <th className="px-5 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {filteredTccs.map((tcc) => (
                      <tr key={tcc.id} className="hover:bg-gray-50/30 dark:hover:bg-zinc-800/25 transition-colors">
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-[#216f7d]/10 text-[#216f7d] dark:bg-[#216f7d]/20 dark:text-[#2dd4bf] rounded-full shrink-0">
                              <User className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white text-xs">{tcc.student}</div>
                              <div className="text-[10px] text-gray-400">Orientador: {tcc.orientador}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-medium text-gray-800 dark:text-gray-200 line-clamp-1 max-w-lg">
                            {tcc.title}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-center whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400">
                            {tcc.period}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center whitespace-nowrap">
                          {tcc.final_average !== null ? (
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black border ${getGradeColor(tcc.final_average)}`}>
                              {tcc.final_average.toFixed(2)}
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30">
                              Parcial
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.get(route('admin.results'), { tcc: tcc.id, period: tcc.period })}
                            className="text-[#216f7d] hover:text-[#164e58] hover:bg-[#216f7d]/5 dark:text-[#2dd4bf] dark:hover:text-[#5eead4] font-bold text-xs h-7 px-2.5 ml-auto flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            Ver Ficha
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400 flex flex-col items-center justify-center gap-1">
                <FolderOpen className="w-8 h-8 text-gray-300" />
                <p className="text-xs">Nenhum TCC avaliado no período.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}