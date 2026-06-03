import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, BookOpen, User, Mail, Calendar, 
  ChevronDown, ChevronUp, AlertCircle, CheckCircle, Clock, 
  Info, Sparkles, FileText, ArrowRight, Printer
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface Subject {
  code: string;
  name: string;
  course_id: string;
}

interface Professor {
  name: string;
  email: string;
}

interface Evaluation {
  id: number;
  name: string;
  code: string;
  type: string;
  max_score: number;
  score: number | null;
}

interface Enrollment {
  enrollment_id: number;
  class_name: string;
  period: string;
  subject: Subject | null;
  professor: Professor | null;
  evaluations: Evaluation[];
  formula: string | null;
  final_average: number | null;
  status: string;
}

export default function StudentDashboard({ enrollments = [] }: { enrollments?: Enrollment[] }) {
  const { props } = usePage();
  const nomenclatures = (props.academic_nomenclatures as Record<string, any>) || {};
  const studentUser = (props.auth as any)?.user || {};

  // Expanded enrollment card states
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  // Helper to get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aprovado':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'reprovado':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'cursando':
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  };

  // Helper to format formula calculation explanation
  const getFormulaExplanation = (formula: string, evaluations: Evaluation[]) => {
    if (!formula) return null;
    let explainedExpr = formula.toUpperCase();
    let replacedExpr = formula.toUpperCase();
    let variablesMissing = false;

    evaluations.forEach(ev => {
      const scoreStr = ev.score !== null ? String(Number(ev.score).toFixed(1)) : '—';
      explainedExpr = explainedExpr.replaceAll(ev.code, `${ev.code} (${scoreStr})`);
      replacedExpr = replacedExpr.replaceAll(ev.code, ev.score !== null ? String(ev.score) : '0');
      if (ev.score === null) {
        variablesMissing = true;
      }
    });

    return {
      explainedExpr,
      replacedExpr,
      variablesMissing
    };
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Meu Boletim', href: '/student/dashboard' }]}>
      <Head title="Meu Boletim - Portal do Aluno" />

      {/* Visual Portal (Hidden on Print) */}
      <div className="flex flex-col gap-6 p-4 md:p-8 pt-0 max-w-5xl mx-auto print:hidden">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#216f7d] to-[#2F506C] rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <GraduationCap className="w-8 h-8 text-cyan-200" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Olá, {studentUser.name}!</h1>
              <p className="text-sm text-cyan-100 mt-1 flex items-center gap-1.5">
                <span>{studentUser.email}</span>
                <span>•</span>
                <span>Portal de Acompanhamento Acadêmico</span>
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xs uppercase tracking-wider font-bold text-cyan-200 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
              Perfil: Aluno
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#216f7d]" />
              Minhas Disciplinas e Notas
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Veja as notas de cada avaliação e acompanhe a composição das suas médias em tempo real.
            </p>
          </div>
          <Button
            onClick={() => window.print()}
            className="bg-[#216f7d] hover:bg-[#1a5b67] text-white flex items-center gap-2 shadow shrink-0"
          >
            <Printer className="w-4 h-4" />
            Imprimir Boletim (PDF)
          </Button>
        </div>

        {/* Classes List */}
        <div className="space-y-4">
          {enrollments && enrollments.length > 0 ? (
            enrollments.map((enrollment) => {
              const isExpanded = expandedId === enrollment.enrollment_id;
              const hasGrades = enrollment.evaluations.length > 0;
              const explanation = enrollment.formula ? getFormulaExplanation(enrollment.formula, enrollment.evaluations) : null;
              
              return (
                <Card key={enrollment.enrollment_id} className="shadow-md hover:shadow-lg border border-gray-100 bg-white rounded-2xl overflow-hidden transition-all duration-300">
                  {/* Card Header clickable to expand */}
                  <div 
                    onClick={() => toggleExpand(enrollment.enrollment_id)}
                    className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/55 transition-colors flex-wrap sm:flex-nowrap select-none"
                  >
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-[#216f7d] bg-[#216f7d]/10 px-2.5 py-0.5 rounded font-bold uppercase shrink-0">
                          {enrollment.subject?.code}
                        </span>
                        <span className="text-xs text-gray-500 font-semibold flex items-center gap-1 shrink-0">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          Semestre {enrollment.period}
                        </span>
                      </div>
                      
                      <h3 className="text-base md:text-lg font-bold text-gray-900 tracking-tight leading-snug">
                        {enrollment.subject?.name}
                      </h3>
                      
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <span className="font-medium text-gray-700">Prof. {enrollment.professor?.name}</span>
                        <span>•</span>
                        <span>{enrollment.class_name}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 justify-between w-full sm:w-auto">
                      <div className="flex flex-col items-center sm:items-end">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Média Final</span>
                        <span className={`font-mono text-xl font-black
                          ${enrollment.final_average !== null && enrollment.final_average >= 6.0 ? 'text-emerald-600' : ''}
                          ${enrollment.final_average !== null && enrollment.final_average < 6.0 ? 'text-red-500' : ''}
                          ${enrollment.final_average === null ? 'text-gray-400' : ''}
                        `}>
                          {enrollment.final_average !== null ? Number(enrollment.final_average).toFixed(2) : '—'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border capitalize shadow-sm
                          ${getStatusBadge(enrollment.status)}
                        `}>
                          {enrollment.status === 'aprovado' && <CheckCircle className="w-3.5 h-3.5 mr-1" />}
                          {enrollment.status === 'reprovado' && <AlertCircle className="w-3.5 h-3.5 mr-1" />}
                          {enrollment.status === 'cursando' && <Clock className="w-3.5 h-3.5 mr-1 text-blue-500" />}
                          {enrollment.status}
                        </span>
                        
                        <Button variant="ghost" size="sm" className="p-1 text-gray-400 hover:bg-gray-100 rounded-full h-8 w-8">
                          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Card Content expanded */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/30 p-5 md:p-6 space-y-6">
                      
                      {/* Evaluations breakdown */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-cyan-600" />
                          Detalhamento das Notas
                        </h4>
                        
                        {!hasGrades ? (
                          <div className="p-6 text-center bg-white border border-gray-200 rounded-xl text-gray-400 text-sm">
                            Nenhum parâmetro de avaliação cadastrado para esta turma pelo professor.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {enrollment.evaluations.map((evalItem) => {
                              const catLabel = nomenclatures[evalItem.type]?.label || evalItem.type;
                              return (
                                <div 
                                  key={evalItem.id}
                                  className="bg-white border border-gray-200/60 p-4 rounded-xl flex items-center justify-between shadow-sm hover:border-[#216f7d]/20 transition-all"
                                >
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-xs font-bold bg-[#216f7d]/10 text-[#216f7d] px-2 py-0.5 rounded">
                                        {evalItem.code}
                                      </span>
                                      <span className="text-sm font-bold text-gray-800">{evalItem.name}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 capitalize mt-1">Categoria: {catLabel} • Peso/Máx: {Number(evalItem.max_score)}</p>
                                  </div>
                                  
                                  <div className="text-right">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">Nota</span>
                                    <span className={`font-mono text-base font-extrabold
                                      ${evalItem.score !== null ? 'text-gray-900' : 'text-gray-400'}
                                    `}>
                                      {evalItem.score !== null ? Number(evalItem.score).toFixed(2) : '—'}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Math Grade Formula Explanation */}
                      {enrollment.formula && explanation && (
                        <Card className="border border-cyan-500/20 bg-[#216f7d]/5 rounded-xl shadow-none p-5 space-y-4">
                          <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-[#216f7d] shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <h4 className="text-sm font-bold text-gray-900">Como é calculada a sua média?</h4>
                              <p className="text-xs text-gray-500">
                                O professor configurou uma fórmula matemática personalizada para esta turma baseada nos parâmetros cadastrados.
                              </p>
                            </div>
                          </div>

                          <div className="border-t border-cyan-500/10 pt-4 space-y-3 font-mono">
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase tracking-wide block mb-1">Expressão Matemática</span>
                              <div className="bg-[#1b3447]/95 border border-cyan-500/20 text-white rounded-lg p-3 text-sm font-bold tracking-wider leading-relaxed">
                                {enrollment.formula}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                              <div>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wide block mb-1">Aplicação dos Seus Valores</span>
                                <div className="bg-white dark:bg-zinc-900 border border-gray-200 rounded-lg p-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                  {explanation.explainedExpr}
                                </div>
                              </div>

                              <div>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wide block mb-1">Resolução do Cálculo</span>
                                <div className="bg-white dark:bg-zinc-900 border border-gray-200 rounded-lg p-3 text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                                  <span className="truncate max-w-[70%]">{explanation.replacedExpr}</span>
                                  <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0 mx-1" />
                                  <span className="font-bold text-[#216f7d]">
                                    {enrollment.final_average !== null ? Number(enrollment.final_average).toFixed(2) : '—'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {explanation.variablesMissing && (
                              <p className="font-sans text-[11px] text-amber-700 flex items-start gap-1 font-medium bg-amber-50 border border-amber-200/50 p-2.5 rounded-lg">
                                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                Algumas notas desta disciplina ainda não foram lançadas. A média final estimada no cabeçalho considera o valor zero para as avaliações pendentes.
                              </p>
                            )}
                          </div>
                        </Card>
                      )}
                    </div>
                  )}
                </Card>
              );
            })
          ) : (
            <div className="bg-white p-12 text-center border border-gray-100 rounded-2xl shadow-md text-gray-400">
              <BookOpen className="w-14 h-14 text-gray-200 mx-auto mb-3" />
              Você não está matriculado em nenhuma turma de disciplina para o período atual.
            </div>
          )}
        </div>
      </div>

      {/* Printable Official Transcript (Visible only on Print) */}
      <div className="hidden print:block p-8 space-y-6 font-sans text-gray-900 bg-white max-w-4xl mx-auto">
        <div className="text-center space-y-2 border-b-2 border-gray-900 pb-4">
          <h1 className="text-2xl font-bold uppercase tracking-wide">Centro Universitário Paraíso (UNIFAP)</h1>
          <h2 className="text-lg font-bold text-gray-700">Histórico Escolar / Boletim Acadêmico</h2>
          <p className="text-xs text-gray-400">Gerado automaticamente em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-sm bg-gray-50 border border-gray-200 p-4 rounded-xl">
          <div><strong>Aluno(a):</strong> {studentUser.name}</div>
          <div><strong>E-mail Institucional:</strong> {studentUser.email}</div>
          <div><strong>Curso Acadêmico:</strong> {enrollments[0]?.subject?.course_id?.toUpperCase() === 'SI' ? 'Sistemas de Informação (SI)' : 'Análise e Desenvolvimento de Sistemas (ADS)'}</div>
          <div><strong>Semestre de Referência:</strong> {enrollments[0]?.period || '2026.1'}</div>
        </div>

        <div className="space-y-6 pt-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200 pb-1">
            Relação de Notas e Aproveitamento
          </h3>

          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-gray-700">
                <th className="py-2.5 text-left font-bold w-[120px]">Código</th>
                <th className="py-2.5 text-left font-bold">Disciplina</th>
                <th className="py-2.5 text-center font-bold w-[150px]">Fórmula Aplicada</th>
                <th className="py-2.5 text-center font-bold w-[120px]">Média Final</th>
                <th className="py-2.5 text-center font-bold w-[120px]">Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {enrollments.map(e => (
                <tr key={e.enrollment_id} className="align-middle">
                  <td className="py-3 font-mono text-xs text-gray-600">{e.subject?.code}</td>
                  <td className="py-3 font-bold text-gray-900">{e.subject?.name}</td>
                  <td className="py-3 text-center font-mono text-xs text-gray-500">{e.formula || 'Média Aritmética'}</td>
                  <td className="py-3 text-center font-mono font-bold text-gray-900">
                    {e.final_average !== null ? Number(e.final_average).toFixed(2) : '—'}
                  </td>
                  <td className="py-3 text-center">
                    <span className="uppercase text-xs font-bold tracking-wider">
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-16 text-center text-xs text-gray-400 border-t border-gray-100">
          <p>Este boletim escolar é emitido digitalmente para fins de consulta e acompanhamento acadêmico.</p>
          <p className="mt-1">UNIFAP — Pró-Reitoria de Graduação e Assuntos Acadêmicos</p>
        </div>
      </div>
    </AppLayout>
  );
}
