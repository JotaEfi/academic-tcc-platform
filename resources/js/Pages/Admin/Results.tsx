import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FileSpreadsheet,
  Search,
  Calendar,
  Clock,
  MapPin,
  User,
  GraduationCap,
  Award,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronRight,
  Sparkles
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
  period: string;
  orientador: string;
  location: string;
  defense_date: string | null;
  defense_time: string | null;
  etapa1_average: number;
  etapa2_average: number;
  final_average: number | null;
  professor_grades: ProfessorGrade[];
  evaluators: string[];
  is_complete: boolean;
}

interface Stats {
  totalBancas: number;
  completedBancas: number;
  pendingBancas: number;
  geralAverage: number;
  maxGrade: number;
}

interface Props {
  tccs: Tcc[];
  availablePeriods: string[];
  filters: {
    period: string | null;
  };
  stats: Stats;
}

export default function ResultsPage({ tccs = [], availablePeriods = [], filters = { period: null }, stats }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Initialize selection with the query param tcc or first item
  const [selectedTccId, setSelectedTccId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tccParam = urlParams.get('tcc');
      if (tccParam && tccs.some(t => t.id === tccParam)) {
        return tccParam;
      }
    }
    return tccs.length > 0 ? tccs[0].id : null;
  });

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const period = e.target.value;
    router.get(
      route('admin.results'),
      period ? { period } : {},
      { 
        preserveState: true, 
        preserveScroll: true,
        onSuccess: (page) => {
          const newTccs = page.props.tccs as Tcc[];
          if (newTccs && newTccs.length > 0) {
            setSelectedTccId(newTccs[0].id);
          } else {
            setSelectedTccId(null);
          }
        }
      }
    );
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 9) return 'bg-emerald-50/60 text-emerald-800 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
    if (grade >= 7) return 'bg-sky-50/60 text-sky-800 border-sky-100 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30';
    if (grade >= 5) return 'bg-amber-50/60 text-amber-800 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
    return 'bg-rose-50/60 text-rose-800 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30';
  };

  const getGradeTextColor = (grade: number) => {
    if (grade >= 9) return 'text-emerald-600 dark:text-emerald-400';
    if (grade >= 7) return 'text-sky-600 dark:text-sky-400';
    if (grade >= 5) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  // Filter local results
  const filteredTccs = tccs.filter(t => 
    t.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.orientador.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Keep track of the currently selected TCC
  const selectedTcc = tccs.find(t => t.id === selectedTccId) || null;

  // Find TCC with highest final average
  const maxGradeTcc = filteredTccs.reduce((max, t) => {
    if (t.final_average === null) return max;
    if (!max || t.final_average > (max.final_average ?? 0)) return t;
    return max;
  }, null as Tcc | null);

  return (
    <AppLayout breadcrumbs={[{ title: 'Resultados', href: route('admin.results') }]}>
      <Head title="Resultados das Bancas" />

      <div className="flex flex-col gap-5 p-4 md:p-6 pt-0 max-w-7xl mx-auto w-full">
        {/* Header Block & Filters (Unified and Minimal) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              Resultados das Bancas
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Notas, médias e fichas de avaliação consolidadas.</p>
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
                placeholder="Buscar por estudante ou palavra-chave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus-visible:ring-[#216f7d]"
              />
            </div>

            {/* Export CSV button */}
            <Button
              onClick={() => window.location.href = route('admin.export')}
              className="h-8 text-xs bg-[#216f7d] hover:bg-[#164e58] text-white px-3 gap-1.5 rounded-lg shrink-0 transition-colors shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Planilha Geral
            </Button>
          </div>
        </div>

        {/* Minimalist Stats Strip (Takes much less space, looks super premium) */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl p-3 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block">Bancas</span>
              <span className="text-lg font-extrabold text-gray-900 dark:text-white mt-0.5 block">{stats.totalBancas}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">{stats.completedBancas} completas</span>
              <span className="text-[10px] text-amber-500 dark:text-amber-400 font-semibold block">{stats.pendingBancas} parciais</span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl p-3 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block">Média Geral</span>
              <span className="text-lg font-extrabold text-gray-900 dark:text-white mt-0.5 block">
                {stats.geralAverage > 0 ? stats.geralAverage.toFixed(2) : 'N/A'}
              </span>
            </div>
            <Award className="h-4 w-4 text-indigo-400 shrink-0" />
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl p-3 flex items-center justify-between shadow-sm min-w-0">
            <div className="min-w-0 flex-1 pr-2">
              <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block">Maior Nota</span>
              <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block truncate">
                {stats.maxGrade > 0 ? stats.maxGrade.toFixed(2) : 'N/A'}
              </span>
            </div>
            <div className="text-right min-w-0 max-w-[120px]">
              <span className="text-[9px] text-gray-400 dark:text-zinc-500 block truncate">Aluno Destaque</span>
              <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 block truncate">
                {maxGradeTcc ? maxGradeTcc.student.split(' ')[0] : 'N/A'}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl p-3 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block">Conclusão</span>
              <span className="text-lg font-extrabold text-gray-900 dark:text-white mt-0.5 block">
                {stats.totalBancas > 0 ? Math.round((stats.completedBancas / stats.totalBancas) * 100) : 0}%
              </span>
            </div>
            <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0" />
          </div>
        </div>

        {/* Core Layout: TCC List + Detailed Evaluation View */}
        <div className="grid gap-4 lg:grid-cols-12 items-start">
          {/* Left Column: TCC List (Clean, light aesthetic) */}
          <Card className="lg:col-span-5 border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden flex flex-col h-[520px] shadow-sm">
            <div className="border-b border-gray-100 dark:border-zinc-800/60 py-3 px-4 flex items-center justify-between bg-gray-50/30 dark:bg-zinc-900/20">
              <h2 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Trabalhos Registrados ({filteredTccs.length})</h2>
            </div>
            
            <CardContent className="p-2 overflow-y-auto flex-1 custom-scrollbar">
              {filteredTccs.length > 0 ? (
                <div className="space-y-1">
                  {filteredTccs.map((tcc) => {
                    const isSelected = tcc.id === selectedTccId;
                    return (
                      <button
                        key={tcc.id}
                        type="button"
                        onClick={() => setSelectedTccId(tcc.id)}
                        className={`w-full text-left rounded-lg border p-3 transition-all duration-150 flex flex-col gap-1.5 ${
                          isSelected
                            ? 'border-[#216f7d] bg-[#216f7d]/5 text-[#1b5b67] dark:bg-[#216f7d]/10 dark:text-[#2dd4bf] dark:border-[#2dd4bf]/40'
                            : 'border-gray-50 bg-white dark:bg-zinc-900 dark:border-zinc-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-zinc-800/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              isSelected ? 'bg-[#216f7d]/15 text-[#1b5b67] dark:bg-[#216f7d]/20 dark:text-[#2dd4bf]' : 'bg-gray-100 text-gray-600 dark:bg-zinc-850 dark:text-gray-400'
                            }`}>
                              {tcc.period}
                            </span>
                            <h3 className="text-xs font-semibold mt-1 leading-snug line-clamp-1">
                              {tcc.title}
                            </h3>
                          </div>

                          <div className="shrink-0">
                            {tcc.final_average !== null ? (
                              <div className={`px-2 py-0.5 rounded text-[10px] font-black border ${getGradeColor(tcc.final_average)}`}>
                                {tcc.final_average.toFixed(2)}
                              </div>
                            ) : (
                              <div className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30">
                                Parcial
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px]">
                          <div className={`flex items-center gap-1 ${isSelected ? 'text-[#216f7d]/80 dark:text-[#2dd4bf]/80' : 'text-gray-400'}`}>
                            <User className="w-3 h-3" />
                            <span className="truncate max-w-[180px] font-medium">{tcc.student}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {tcc.is_complete ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            )}
                            <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-[#216f7d] dark:text-[#2dd4bf]' : 'text-gray-300'}`} />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20 text-gray-400 flex flex-col items-center justify-center gap-1.5">
                  <AlertTriangle className="w-8 h-8 text-gray-300" />
                  <p className="text-xs">Nenhum TCC avaliado encontrado.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Column: Detailed View (Clean, minimalist sheet) */}
          <Card className="lg:col-span-7 border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden flex flex-col h-[520px] shadow-sm">
            {selectedTcc ? (
              <div className="flex flex-col h-full overflow-hidden">
                {/* Detail Header (Light, neat background) */}
                <div className="p-4 border-b border-gray-100 dark:border-zinc-800/60 bg-gray-50/30 dark:bg-zinc-900/20 shrink-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex gap-2 items-center flex-wrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#216f7d]/10 text-[#216f7d] dark:bg-[#216f7d]/20 dark:text-[#2dd4bf]">
                          Período: {selectedTcc.period}
                        </span>
                        {selectedTcc.is_complete ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 gap-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            Finalizado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 gap-0.5">
                            <AlertTriangle className="w-3 h-3 animate-pulse" />
                            Notas Parciais
                          </span>
                        )}
                      </div>
                      <h2 className="text-sm md:text-base font-bold text-gray-900 dark:text-white mt-1.5 leading-snug line-clamp-2">
                        {selectedTcc.title}
                      </h2>
                    </div>

                    <div className="flex flex-col items-center justify-center px-3 py-1.5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-xl shadow-sm min-w-[80px]">
                      <span className="text-[8px] font-bold uppercase tracking-wider opacity-80">Média Final</span>
                      <span className="text-lg font-black leading-none mt-0.5">
                        {selectedTcc.final_average !== null ? selectedTcc.final_average.toFixed(2) : 'Pendente'}
                      </span>
                    </div>
                  </div>

                  {/* Metadata labels row */}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 border-t border-gray-100 dark:border-zinc-800/60 pt-3 text-[11px] text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1.5 truncate">
                      <GraduationCap className="w-3.5 h-3.5 text-[#216f7d] shrink-0" />
                      <span className="truncate"><strong>Estudante:</strong> {selectedTcc.student}</span>
                    </span>
                    <span className="flex items-center gap-1.5 truncate">
                      <User className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span className="truncate"><strong>Orientador:</strong> {selectedTcc.orientador}</span>
                    </span>
                    <span className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate"><strong>Local:</strong> {selectedTcc.location}</span>
                    </span>
                  </div>
                </div>

                {/* Detailed Grades Panel (Scrollable) */}
                <div className="p-4 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
                  {/* Step Averages Side by Side */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="p-3 bg-gray-50/50 dark:bg-zinc-800/30 rounded-lg border border-gray-100 dark:border-zinc-800/80 flex items-center gap-3">
                      <div className="p-2 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-medium block leading-none">Etapa 1 (Escrita)</span>
                        <div className={`text-sm font-bold mt-0.5 ${getGradeTextColor(selectedTcc.etapa1_average)}`}>
                          {selectedTcc.etapa1_average > 0 ? selectedTcc.etapa1_average.toFixed(2) : 'Pendente'}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50/50 dark:bg-zinc-800/30 rounded-lg border border-gray-100 dark:border-zinc-800/80 flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-medium block leading-none">Etapa 2 (Apresentação)</span>
                        <div className={`text-sm font-bold mt-0.5 ${getGradeTextColor(selectedTcc.etapa2_average)}`}>
                          {selectedTcc.etapa2_average > 0 ? selectedTcc.etapa2_average.toFixed(2) : 'Pendente'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Individual Evaluator Breakdown Table (Ultra simplified, thin margins) */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#216f7d]" />
                      Notas por Avaliador
                    </h3>
                    <div className="overflow-x-auto border border-gray-100 dark:border-zinc-800 rounded-lg">
                      <table className="w-full text-xs text-left text-gray-700 dark:text-gray-300">
                        <thead className="bg-gray-50/50 dark:bg-zinc-800/40 border-b border-gray-100 dark:border-zinc-800 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          <tr>
                            <th className="px-3 py-2">Membro</th>
                            <th className="px-3 py-2 text-center">Etapa 1 (70%)</th>
                            <th className="px-3 py-2 text-center">Etapa 2 (30%)</th>
                            <th className="px-3 py-2 text-right">Final</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                          {selectedTcc.professor_grades && selectedTcc.professor_grades.length > 0 ? (
                            selectedTcc.professor_grades.map((pg, idx) => (
                              <tr key={idx} className="hover:bg-gray-50/40 dark:hover:bg-zinc-800/25 transition-colors">
                                <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                  {pg.professor}
                                  {pg.professor === selectedTcc.orientador && (
                                    <span className="ml-1.5 inline-flex items-center px-1 bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30 rounded text-[8px] font-bold">
                                      Orientador
                                    </span>
                                  )}
                                </td>
                                <td className="px-3 py-2.5 text-center font-bold">
                                  {pg.etapa1_grade !== null ? (
                                    <span className={`inline-block px-1.5 py-0.2 rounded border ${getGradeColor(pg.etapa1_grade)}`}>
                                      {pg.etapa1_grade.toFixed(2)}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 dark:text-zinc-650 italic text-[10px] font-normal">Pendente</span>
                                  )}
                                </td>
                                <td className="px-3 py-2.5 text-center font-bold">
                                  {pg.etapa2_grade !== null ? (
                                    <span className={`inline-block px-1.5 py-0.2 rounded border ${getGradeColor(pg.etapa2_grade)}`}>
                                      {pg.etapa2_grade.toFixed(2)}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 dark:text-zinc-650 italic text-[10px] font-normal">Pendente</span>
                                  )}
                                </td>
                                <td className="px-3 py-2.5 text-right font-black">
                                  {pg.final_grade !== null ? (
                                    <span className={getGradeTextColor(pg.final_grade)}>
                                      {pg.final_grade.toFixed(2)}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 dark:text-zinc-650 italic text-[10px] font-normal">Pendente</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="px-3 py-6 text-center text-gray-400">
                                Nenhuma avaliação registrada.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Defense details */}
                  <div className="p-3 bg-zinc-50/50 dark:bg-zinc-800/10 rounded-lg border border-gray-100 dark:border-zinc-800/80">
                    <div className="grid grid-cols-2 gap-3 text-[10px] font-semibold text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#216f7d]" />
                        <span><strong>Data:</strong> {selectedTcc.defense_date || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span><strong>Horário:</strong> {selectedTcc.defense_time || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <div className="p-3 bg-gray-50 dark:bg-zinc-800/40 rounded-full text-gray-300 dark:text-zinc-700 mb-3">
                  <Award className="w-10 h-10" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Nenhum TCC Selecionado</h3>
                <p className="text-xs text-gray-500 max-w-xs mt-0.5">
                  Selecione um trabalho na lista lateral para carregar a ficha de notas completa.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
