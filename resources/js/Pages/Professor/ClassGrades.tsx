import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, Plus, Trash2, Save, Sparkles, CheckCircle, AlertCircle, 
  Info, Percent, HelpCircle, FileText, ChevronRight, GraduationCap,
  Loader2
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Subject {
  id: number;
  code: string;
  name: string;
}

interface ClassEvaluation {
  id: number;
  name: string;
  code: string;
  type: string;
  max_score: number;
}

interface StudentRoster {
  enrollment_id: number;
  student_id: number;
  name: string;
  grades: Record<string, string | number>;
  final_average: number | null;
  status: string;
}

interface OfferingClass {
  id: number;
  period: string;
  name: string;
  subject?: Subject;
}

export default function ClassGradesPage({ 
  class: cls, 
  evaluations = [], 
  formula = '', 
  roster = [] 
}: { 
  class: OfferingClass; 
  evaluations?: ClassEvaluation[]; 
  formula?: string; 
  roster?: StudentRoster[];
}) {
  const { props } = usePage();
  const flash = props.flash as { success?: string, error?: string } || {};
  const nomenclatures = (props.academic_nomenclatures as Record<string, any>) || {};

  // Roster Local Grades State for live calculation & editing
  const [localRoster, setLocalRoster] = useState<StudentRoster[]>(roster);
  const [isDirty, setIsDirty] = useState(false);

  // Sync state if roster prop updates
  useEffect(() => {
    setLocalRoster(roster);
    setIsDirty(false);
  }, [roster]);

  // Create Evaluation Modal
  const [isEvalOpen, setIsEvalOpen] = useState(false);
  const evalForm = useForm({
    name: '',
    code: '',
    type: Object.keys(nomenclatures)[0] || 'prova',
    max_score: '10.0'
  });

  // Formula state
  const [formulaExpr, setFormulaExpr] = useState(formula);
  const [formulaError, setFormulaError] = useState<string | null>(null);
  const [formulaSimResult, setFormulaSimResult] = useState<string | null>(null);
  const formulaForm = useForm({ formula: '' });

  // Add new evaluation
  const handleCreateEval = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedCode = evalForm.data.code.toUpperCase().replace(/[^A-Z0-9]/g, '');
    evalForm.setData('code', formattedCode);

    evalForm.post(route('professor.classes.evaluations.store', cls.id), {
      onSuccess: () => {
        setIsEvalOpen(false);
        evalForm.reset();
      }
    });
  };

  // Delete evaluation
  const handleDeleteEval = (id: number) => {
    if (confirm('Tem certeza que deseja remover esta avaliação? Isso excluirá todas as notas atribuídas a ela.')) {
      router.delete(route('professor.classes.evaluations.destroy', [cls.id, id]));
    }
  };

  // Live Formula syntax checker
  useEffect(() => {
    if (!formulaExpr) {
      setFormulaError(null);
      setFormulaSimResult(null);
      return;
    }

    const expr = formulaExpr.toUpperCase().replace(/\s+/g, '');
    const allowedVariables = evaluations.map(ev => ev.code);

    // Basic regex validation for characters
    if (/[^A-Z0-9\+\-\*\/\(\)\.]/.test(expr)) {
      setFormulaError('Contém caracteres inválidos (use apenas variáveis, números, +, -, *, /, parênteses).');
      setFormulaSimResult(null);
      return;
    }

    // Parentheses balance check
    let balance = 0;
    for (let char of expr) {
      if (char === '(') balance++;
      if (char === ')') balance--;
      if (balance < 0) {
        setFormulaError('Parênteses fechados incorretamente.');
        setFormulaSimResult(null);
        return;
      }
    }
    if (balance !== 0) {
      setFormulaError('Parênteses abertos e não fechados.');
      setFormulaSimResult(null);
      return;
    }

    // Variable check using token split
    const tokens = expr.split(/[\+\-\*\/\(\)]+/).filter(t => t.length > 0 && isNaN(Number(t)) && !/^\d*\.?\d+$/.test(t));
    for (let token of tokens) {
      if (!allowedVariables.includes(token)) {
        setFormulaError(`Variável desconhecida detectada: "${token}". Crie esta avaliação antes.`);
        setFormulaSimResult(null);
        return;
      }
    }

    // Simulating the formula calculation with value 10 for each variable
    try {
      // Safe dynamic evaluator substitute for simulation
      let simExpr = expr;
      allowedVariables.forEach(v => {
        simExpr = simExpr.replaceAll(v, '10');
      });
      // Safe JS calculation via simple expression evaluator
      const fn = new Function(`return ${simExpr}`);
      const simVal = fn();
      if (isNaN(simVal) || !isFinite(simVal)) {
        setFormulaError('Fórmula matemática malformada.');
        setFormulaSimResult(null);
      } else {
        setFormulaError(null);
        setFormulaSimResult(`Exemplo de cálculo: se todas as notas forem 10.0, a média final será: ${Number(simVal).toFixed(2)}`);
      }
    } catch (e) {
      setFormulaError('Fórmula inválida.');
      setFormulaSimResult(null);
    }
  }, [formulaExpr, evaluations]);

  // Submit Formula to backend
  const handleFormulaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formulaError) return;

    formulaForm.setData('formula', formulaExpr);
    router.post(route('professor.classes.formula.store', cls.id), {
      formula: formulaExpr
    }, {
      onSuccess: () => {
        setIsDirty(false);
      }
    });
  };

  // Input grade handler in our spreadsheet
  const handleGradeChange = (enrollmentId: number, code: string, value: string) => {
    // Validate value bounds [0, 100] or empty
    if (value !== '') {
      const num = Number(value);
      if (isNaN(num) || num < 0 || num > 100) return;
    }

    setLocalRoster(prev => prev.map(student => {
      if (student.enrollment_id === enrollmentId) {
        const updatedGrades = { ...student.grades, [code]: value };
        
        // Dynamic live final average estimation for UX feedback
        let estimatedAverage = student.final_average;
        if (formulaExpr && !formulaError) {
          try {
            let simExpr = formulaExpr.toUpperCase().replace(/\s+/g, '');
            let canCalculate = true;
            
            evaluations.forEach(ev => {
              const val = updatedGrades[ev.code];
              if (val !== undefined && val !== null && val !== '') {
                simExpr = simExpr.replaceAll(ev.code, String(val));
              } else {
                simExpr = simExpr.replaceAll(ev.code, '0'); // default missing to 0 for estimate
              }
            });

            const estimate = new Function(`return ${simExpr}`)();
            if (!isNaN(estimate) && isFinite(estimate)) {
              estimatedAverage = Number(Number(estimate).toFixed(2));
            }
          } catch (e) {}
        }

        return {
          ...student,
          grades: updatedGrades,
          final_average: estimatedAverage
        };
      }
      return student;
    }));
    setIsDirty(true);
  };

  // Batch Save student grades
  const handleSaveGrades = () => {
    const payload = localRoster.map(s => ({
      enrollment_id: s.enrollment_id,
      grades: s.grades
    }));

    router.post(route('professor.classes.grades.save', cls.id), {
      roster: payload
    }, {
      onSuccess: () => {
        setIsDirty(false);
      }
    });
  };

  // Add variable code tag to formula input at cursor position
  const handleAddTag = (code: string) => {
    setFormulaExpr(prev => prev ? `${prev} + ${code}` : code);
  };

  return (
    <AppLayout breadcrumbs={[
      { title: 'Minhas Turmas', href: route('professor.classes') },
      { title: 'Lançar Notas', href: route('professor.classes.grades', cls.id) }
    ]}>
      <Head title={`Lançar Notas - ${cls.subject?.name}`} />

      <div className="flex flex-col gap-6 p-4 md:p-8 pt-0">
        <div className="flex items-center gap-4">
          <Link 
            href={route('professor.classes')}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors shadow-sm bg-white border border-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {cls.subject?.name} - {cls.name}
            </h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <span className="font-semibold text-[#216f7d]">{cls.subject?.code}</span>
              <span>•</span>
              <span>Período Letivo: <strong>{cls.period}</strong></span>
            </p>
          </div>
        </div>

        {flash.success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-4 flex items-center gap-3 shadow-sm">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-medium">{flash.success}</p>
          </div>
        )}
        {flash.error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-center gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <p className="text-sm font-medium">{flash.error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Left Column: Evaluations & Formula Setup */}
          <div className="space-y-6">
            
            {/* Evaluations Panel */}
            <Card className="shadow-lg border-0 bg-white rounded-xl">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-gray-900">Avaliações Ativas</CardTitle>
                  <CardDescription>Cadastre as provas, projetos e atividades da turma.</CardDescription>
                </div>
                <Button 
                  size="sm"
                  onClick={() => setIsEvalOpen(true)}
                  className="bg-[#216f7d] hover:bg-[#1a5b67] text-white flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Nova
                </Button>
              </CardHeader>
              <CardContent className="space-y-3 pt-3">
                {evaluations && evaluations.length > 0 ? (
                  evaluations.map(ev => {
                    const typeLabel = nomenclatures[ev.type]?.label || ev.type;
                    return (
                      <div key={ev.id} className="flex justify-between items-center p-3 rounded-lg border border-gray-100 hover:border-cyan-500/20 bg-gray-50/50 hover:bg-white transition-all shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold bg-cyan-600/10 text-[#216f7d] px-2.5 py-1 rounded">
                            {ev.code}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-gray-800">{ev.name}</p>
                            <p className="text-[10px] text-gray-400 capitalize">{typeLabel} • Valor Máx: {Number(ev.max_score)}</p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1"
                          onClick={() => handleDeleteEval(ev.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-400 text-center py-6">
                    Nenhuma avaliação cadastrada ainda.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Formula Panel */}
            <Card className="shadow-lg border-0 bg-white rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-900">Fórmula de Média Final</CardTitle>
                <CardDescription>Crie fórmulas matemáticas livres e personalizadas para esta turma.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFormulaSubmit} className="space-y-4">
                  
                  {/* Cliqueable evaluation short codes as badges */}
                  {evaluations.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Variáveis Disponíveis (Clique para inserir)</span>
                      <div className="flex gap-1.5 flex-wrap">
                        {evaluations.map(ev => (
                          <button
                            type="button"
                            key={ev.id}
                            onClick={() => handleAddTag(ev.code)}
                            className="font-mono text-xs font-bold bg-[#216f7d]/10 hover:bg-[#216f7d]/20 text-[#216f7d] px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                          >
                            {ev.code}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5 pt-2">
                    <label htmlFor="formula_input" className="text-xs font-semibold text-gray-500 uppercase">Expressão Algébrica</label>
                    <div className="relative flex items-center">
                      <Input
                        id="formula_input"
                        value={formulaExpr}
                        onChange={e => setFormulaExpr(e.target.value)}
                        placeholder="Ex: (P1 * 0.4) + (T1 * 0.6)"
                        className="font-mono text-sm border-gray-300 focus:ring-[#216f7d] focus:border-[#216f7d]"
                      />
                    </div>
                    {formulaError ? (
                      <p className="text-xs text-red-500 flex items-start gap-1 font-medium mt-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        {formulaError}
                      </p>
                    ) : formulaSimResult ? (
                      <p className="text-xs text-[#216f7d] flex items-start gap-1 font-medium mt-1">
                        <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-cyan-500 animate-pulse" />
                        {formulaSimResult}
                      </p>
                    ) : null}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-[#2F506C] hover:bg-[#20374b] text-white"
                    disabled={!!formulaError || formulaExpr === formula || evaluations.length === 0}
                  >
                    Salvar e Recalcular Fórmula
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Academic Info Guidelines */}
            <Card className="shadow-lg border-0 bg-amber-50/40 border-amber-200/50 rounded-xl">
              <CardContent className="p-5 text-amber-900 space-y-2 text-xs leading-relaxed">
                <p className="font-bold text-amber-800 flex items-center gap-1">
                  <Info className="w-4 h-4 text-amber-600" />
                  Instruções Acadêmicas para Média
                </p>
                <ul className="list-disc pl-4 space-y-1 text-amber-800/90 font-medium">
                  <li>O sistema valida a sintaxe e a existência de avaliações em tempo real.</li>
                  <li>As médias finais são salvas e arredondadas com até 2 casas decimais.</li>
                  <li>Alunos com média igual ou superior a <strong>6.00</strong> (e com todas as avaliações lançadas) são marcados como <strong>aprovados</strong>.</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Spreadsheet Grade Grid */}
          <div className="xl:col-span-2">
            <Card className="shadow-lg border-0 bg-white rounded-xl">
              <CardHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="text-lg text-gray-900">Diário de Classe & Relação de Notas</CardTitle>
                  <CardDescription>Insira as notas diretamente na planilha. As médias finais recalculam em tempo real.</CardDescription>
                </div>
                <div className="flex gap-3">
                  {isDirty && (
                    <Button 
                      onClick={handleSaveGrades}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow"
                    >
                      <Save className="w-4 h-4" />
                      Salvar Notas
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                {evaluations.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">
                    <FileText className="w-14 h-14 text-gray-200 mx-auto mb-3" />
                    Cadastre pelo menos uma avaliação no painel esquerdo para liberar o lançamento de notas.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-gray-200 rounded-xl">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                          <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider min-w-[200px] border-r border-gray-200">Aluno</th>
                          {evaluations.map(ev => (
                            <th key={ev.id} className="px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wider min-w-[90px] border-r border-gray-200" title={ev.name}>
                              <div className="flex flex-col items-center">
                                <span className="font-mono text-sm text-[#216f7d] font-bold">{ev.code}</span>
                                <span className="text-[9px] text-gray-400 mt-0.5 truncate max-w-[80px]">max {Number(ev.max_score)}</span>
                              </div>
                            </th>
                          ))}
                          <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider min-w-[100px] border-r border-gray-200 bg-cyan-50/20 text-[#216f7d]">Média Final</th>
                          <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider min-w-[110px]">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {localRoster && localRoster.length > 0 ? (
                          localRoster.map((student) => (
                            <tr key={student.enrollment_id} className="hover:bg-gray-50/30 transition-colors">
                              <td className="px-4 py-3.5 text-sm font-semibold text-gray-900 border-r border-gray-200 truncate max-w-[220px]">
                                {student.name}
                              </td>
                              
                              {/* Evaluations inputs columns */}
                              {evaluations.map(ev => {
                                const currentScore = student.grades[ev.code] !== undefined ? student.grades[ev.code] : '';
                                return (
                                  <td key={ev.id} className="px-2 py-2 border-r border-gray-200">
                                    <Input
                                      type="text"
                                      value={currentScore}
                                      onChange={e => handleGradeChange(student.enrollment_id, ev.code, e.target.value)}
                                      className="font-mono font-semibold text-center text-sm border-gray-300 h-9 focus:ring-1 focus:ring-[#216f7d] w-16 mx-auto px-1"
                                      placeholder="—"
                                    />
                                  </td>
                                );
                              })}

                              {/* Live/calculated final average column */}
                              <td className="px-4 py-3.5 text-center border-r border-gray-200 bg-cyan-50/10">
                                <span className={`font-mono text-sm font-bold
                                  ${student.final_average !== null && student.final_average >= 6.0 ? 'text-emerald-600' : ''}
                                  ${student.final_average !== null && student.final_average < 6.0 ? 'text-red-500' : ''}
                                  ${student.final_average === null ? 'text-gray-400' : ''}
                                `}>
                                  {student.final_average !== null ? Number(student.final_average).toFixed(2) : '—'}
                                </span>
                              </td>

                              {/* Status badge column */}
                              <td className="px-4 py-3.5 text-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize
                                  ${student.status === 'aprovado' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : ''}
                                  ${student.status === 'reprovado' ? 'bg-red-50 text-red-800 border border-red-200' : ''}
                                  ${student.status === 'cursando' ? 'bg-blue-50 text-blue-800 border border-blue-200' : ''}
                                `}>
                                  {student.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={evaluations.length + 3} className="px-4 py-8 text-center text-gray-500">
                              Nenhum aluno matriculado nesta turma.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CREATE EVALUATION MODAL */}
      <Dialog open={isEvalOpen} onOpenChange={setIsEvalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Avaliação</DialogTitle>
            <DialogDescription>
              Crie um novo parâmetro de nota. A sigla/código gerada deve ser única e representará a variável na fórmula matemática.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateEval} className="space-y-4 pt-4">
            <div className="flex gap-4">
              <div className="w-1/2 space-y-2">
                <label htmlFor="eval_code" className="text-sm font-medium text-gray-700">Sigla/Código (Fórmula)</label>
                <Input
                  id="eval_code"
                  value={evalForm.data.code}
                  onChange={e => evalForm.setData('code', e.target.value.toUpperCase())}
                  placeholder="Ex: P1, T2, PROJ"
                  className="font-mono text-sm"
                  maxLength={10}
                  required
                />
                {evalForm.errors.code && <p className="text-sm text-red-500">{evalForm.errors.code}</p>}
              </div>

              <div className="w-1/2 space-y-2">
                <label htmlFor="eval_type" className="text-sm font-medium text-gray-700">Categoria</label>
                <select
                  id="eval_type"
                  value={evalForm.data.type}
                  onChange={e => evalForm.setData('type', e.target.value)}
                  className="w-full flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#216f7d] focus:border-transparent transition-shadow cursor-pointer"
                  required
                >
                  {Object.entries(nomenclatures).map(([slug, data]) => (
                    <option key={slug} value={slug}>{data.label}</option>
                  ))}
                </select>
                {evalForm.errors.type && <p className="text-sm text-red-500">{evalForm.errors.type}</p>}
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-1/2 space-y-2">
                <label htmlFor="eval_name" className="text-sm font-medium text-gray-700">Descrição/Nome</label>
                <Input
                  id="eval_name"
                  value={evalForm.data.name}
                  onChange={e => evalForm.setData('name', e.target.value)}
                  placeholder="Ex: Prova Escrita 1"
                  required
                />
                {evalForm.errors.name && <p className="text-sm text-red-500">{evalForm.errors.name}</p>}
              </div>

              <div className="w-1/2 space-y-2">
                <label htmlFor="eval_max" className="text-sm font-medium text-gray-700">Pontuação Máxima</label>
                <Input
                  id="eval_max"
                  type="text"
                  value={evalForm.data.max_score}
                  onChange={e => evalForm.setData('max_score', e.target.value)}
                  required
                />
                {evalForm.errors.max_score && <p className="text-sm text-red-500">{evalForm.errors.max_score}</p>}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEvalOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-[#216f7d] hover:bg-[#1a5b67] text-white" disabled={evalForm.processing}>
                {evalForm.processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
