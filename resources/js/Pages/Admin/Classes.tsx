import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, AlertCircle, CheckCircle, Loader2, Users, GraduationCap, Calendar, Users2 } from 'lucide-react';
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
  course_id: string;
}

interface Professor {
  id: number;
  name: string;
}

interface OfferingClass {
  id: number;
  subject_id: number;
  professor_id: number;
  period: string;
  name: string;
  enrollments_count: number;
  subject?: Subject;
  professor?: Professor;
}

export default function ClassesPage({ 
  classes = [], 
  subjects = [], 
  professors = [] 
}: { 
  classes?: OfferingClass[]; 
  subjects?: Subject[]; 
  professors?: Professor[];
}) {
  const { props } = usePage();
  const flash = props.flash as { success?: string, error?: string } || {};

  const [activeCourseFilter, setActiveCourseFilter] = useState<'all' | 'si' | 'ads'>('all');
  const [selectedCourse, setSelectedCourse] = useState<'si' | 'ads'>('si');

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const createForm = useForm({ 
    subject_id: '', 
    professor_id: professors[0]?.id || '', 
    period: '2026.1', 
    name: '' 
  });

  // Sync subject_id inside create modal form when course selection changes
  useEffect(() => {
    const courseSubjects = subjects.filter(s => s.course_id === selectedCourse);
    createForm.setData('subject_id', courseSubjects[0]?.id || '');
  }, [selectedCourse, subjects]);

  // Delete Modal State
  const [deletingClass, setDeletingClass] = useState<OfferingClass | null>(null);
  const deleteForm = useForm();

  // Handlers
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createForm.post(route('admin.classes.store'), {
      onSuccess: () => {
        setIsCreateOpen(false);
        createForm.reset();
      },
    });
  };

  const handleDelete = () => {
    if (!deletingClass) return;
    deleteForm.delete(route('admin.classes.destroy', deletingClass.id), {
      onSuccess: () => {
        setDeletingClass(null);
      },
    });
  };

  const filteredClasses = classes.filter(cls => {
    if (activeCourseFilter === 'all') return true;
    return cls.subject?.course_id === activeCourseFilter;
  });

  return (
    <AppLayout breadcrumbs={[{ title: 'Turmas', href: route('admin.classes') }]}>
      <Head title="Gerenciar Turmas" />

      <div className="flex flex-col gap-6 p-4 md:p-8 pt-0">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Gerenciar Turmas
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Instancie e gerencie turmas acadêmicas, professores responsáveis e diários de classe.
            </p>
          </div>
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-[#216f7d] hover:bg-[#1a5b67] text-white flex items-center gap-2 shadow"
            disabled={subjects.length === 0 || professors.length === 0}
          >
            <Plus className="w-4 h-4" />
            Nova Turma
          </Button>
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

        {/* Course Filter Tabs */}
        <div className="flex gap-4 border-b border-gray-200 dark:border-zinc-800 pb-px mb-2">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'si', label: 'Sistemas de Informação' },
            { id: 'ads', label: 'Análise e Des. de Sistemas' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCourseFilter(tab.id as any)}
              className={`pb-3 text-sm font-semibold border-b-2 transition-all px-1 cursor-pointer
                ${activeCourseFilter === tab.id 
                  ? 'border-[#216f7d] text-[#216f7d] dark:text-[#2dd4bf] dark:border-[#2dd4bf]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses && filteredClasses.length > 0 ? (
            filteredClasses.map((cls) => (
              <Card key={cls.id} className="shadow-lg hover:shadow-xl border border-gray-100 bg-white rounded-xl overflow-hidden transition-all flex flex-col justify-between">
                <div className="p-6 pb-4">
                  <div className="flex justify-between items-start gap-3">
                    <span className="font-mono text-xs text-[#216f7d] bg-[#216f7d]/10 px-2 py-0.5 rounded font-bold uppercase shrink-0">
                      {cls.subject?.code}
                    </span>
                    <span className="text-xs text-gray-500 font-semibold flex items-center gap-1 shrink-0">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      Semestre {cls.period}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 mt-3 text-lg leading-snug line-clamp-1">
                    {cls.subject?.name}
                  </h3>
                  <p className="text-sm font-medium text-gray-600 mt-1 flex items-center gap-1">
                    {cls.name}
                  </p>

                  <div className="mt-5 space-y-2 border-t border-gray-100 pt-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-cyan-600 shrink-0" />
                      <span className="truncate"><strong>Prof:</strong> {cls.professor?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Alunos Matriculados:</strong> {cls.enrollments_count}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-gray-50 bg-gray-50/50 flex gap-3">
                  <Link 
                    href={route('admin.classes.roster', cls.id)}
                    className="flex-1 inline-flex items-center justify-center bg-white hover:bg-gray-100 text-[#216f7d] border border-gray-200 text-sm font-semibold py-2 px-3 rounded-lg shadow-sm transition-colors text-center"
                  >
                    <Users2 className="w-4 h-4 mr-1.5" />
                    Gerenciar Alunos
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="text-gray-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg"
                    onClick={() => setDeletingClass(cls)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full bg-white p-12 text-center border border-gray-100 rounded-xl shadow-md text-gray-400">
              <Users className="w-14 h-14 text-gray-200 mx-auto mb-3" />
              Nenhuma turma encontrada.
            </div>
          )}
        </div>
      </div>

      {/* CREATE MODAL */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Turma</DialogTitle>
            <DialogDescription>
              Instancie uma nova turma e associe uma disciplina e professor responsável.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label htmlFor="course_select" className="text-sm font-medium text-gray-700">Curso</label>
              <select
                id="course_select"
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value as any)}
                className="w-full flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#216f7d] focus:border-transparent transition-shadow"
                required
              >
                <option value="si">Sistemas de Informação (SI)</option>
                <option value="ads">Análise e Des. de Sistemas (ADS)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="subject_id" className="text-sm font-medium text-gray-700">Disciplina</label>
              <select
                id="subject_id"
                value={createForm.data.subject_id}
                onChange={e => createForm.setData('subject_id', e.target.value)}
                className="w-full flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#216f7d] focus:border-transparent transition-shadow"
                required
              >
                {subjects.filter(s => s.course_id === selectedCourse).map(s => (
                  <option key={s.id} value={s.id}>[{s.code}] {s.name}</option>
                ))}
              </select>
              {createForm.errors.subject_id && <p className="text-sm text-red-500">{createForm.errors.subject_id}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="professor_id" className="text-sm font-medium text-gray-700">Professor Responsável</label>
              <select
                id="professor_id"
                value={createForm.data.professor_id}
                onChange={e => createForm.setData('professor_id', e.target.value)}
                className="w-full flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#216f7d] focus:border-transparent transition-shadow"
                required
              >
                {professors.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {createForm.errors.professor_id && <p className="text-sm text-red-500">{createForm.errors.professor_id}</p>}
            </div>

            <div className="flex gap-4">
              <div className="w-1/2 space-y-2">
                <label htmlFor="period" className="text-sm font-medium text-gray-700">Período Letivo</label>
                <Input
                  id="period"
                  value={createForm.data.period}
                  onChange={e => createForm.setData('period', e.target.value)}
                  placeholder="Ex: 2026.1"
                  required
                />
                {createForm.errors.period && <p className="text-sm text-red-500">{createForm.errors.period}</p>}
              </div>

              <div className="w-1/2 space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">Nome/Sigla da Turma</label>
                <Input
                  id="name"
                  value={createForm.data.name}
                  onChange={e => createForm.setData('name', e.target.value)}
                  placeholder="Ex: Turma A"
                  required
                />
                {createForm.errors.name && <p className="text-sm text-red-500">{createForm.errors.name}</p>}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-[#216f7d] hover:bg-[#1a5b67] text-white" disabled={createForm.processing}>
                {createForm.processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE MODAL */}
      <Dialog open={!!deletingClass} onOpenChange={(open) => !open && setDeletingClass(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Turma</DialogTitle>
            <DialogDescription className="text-red-600">
              Tem certeza que deseja excluir a turma <strong>{deletingClass?.name}</strong> da disciplina <strong>{deletingClass?.subject?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="bg-amber-50 p-3 rounded-md mt-2">
            <p className="text-sm text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              Excluir esta turma deletará todas as notas de avaliações lançadas e as matrículas dos alunos vinculados a ela. Esta ação é definitiva.
            </p>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setDeletingClass(null)}>Cancelar</Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleteForm.processing}>
              {deleteForm.processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Sim, Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
