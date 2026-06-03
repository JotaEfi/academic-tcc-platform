import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, AlertCircle, CheckCircle, Loader2, BookOpen } from 'lucide-react';
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

export default function SubjectsPage({ subjects = [] }: { subjects?: Subject[] }) {
  const { props } = usePage();
  const flash = props.flash as { success?: string, error?: string } || {};

  const [activeCourseFilter, setActiveCourseFilter] = useState<'all' | 'si' | 'ads'>('all');

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const createForm = useForm({ 
    code: '', 
    name: '',
    course_id: 'si'
  });

  // Delete Modal State
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
  const deleteForm = useForm();

  // Handlers
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createForm.post(route('admin.subjects.store'), {
      onSuccess: () => {
        setIsCreateOpen(false);
        createForm.reset();
      },
    });
  };

  const handleDelete = () => {
    if (!deletingSubject) return;
    deleteForm.delete(route('admin.subjects.destroy', deletingSubject.id), {
      onSuccess: () => {
        setDeletingSubject(null);
      },
    });
  };

  const filteredSubjects = subjects.filter(sub => {
    if (activeCourseFilter === 'all') return true;
    return sub.course_id === activeCourseFilter;
  });

  return (
    <AppLayout breadcrumbs={[{ title: 'Disciplinas', href: route('admin.subjects') }]}>
      <Head title="Gerenciar Disciplinas" />

      <div className="flex flex-col gap-6 p-4 md:p-8 pt-0">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Gerenciar Disciplinas
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Gerencie a grade curricular e as disciplinas ativas nos cursos.
            </p>
          </div>
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-[#216f7d] hover:bg-[#1a5b67] text-white flex items-center gap-2 shadow"
          >
            <Plus className="w-4 h-4" />
            Nova Disciplina
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

        <Card className="shadow-xl border-0 bg-white">
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/4">Código</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nome da Disciplina</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSubjects && filteredSubjects.length > 0 ? (
                    filteredSubjects.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-[#216f7d] bg-[#216f7d]/10 px-2.5 py-1 rounded font-bold">
                              {sub.code}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                              {sub.course_id.toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-gray-900">{sub.name}</td>
                        <td className="px-4 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-red-600 hover:bg-red-50 h-8 px-2"
                            onClick={() => setDeletingSubject(sub)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-12 text-center text-gray-400">
                        <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                        Nenhuma disciplina encontrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CREATE MODAL */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Disciplina</DialogTitle>
            <DialogDescription>
              Cadastre uma nova disciplina na grade curricular.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label htmlFor="course_id" className="text-sm font-medium text-gray-700">Curso</label>
              <select
                id="course_id"
                value={createForm.data.course_id}
                onChange={e => createForm.setData('course_id', e.target.value)}
                className="w-full flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#216f7d] focus:border-transparent transition-shadow"
                required
              >
                <option value="si">Sistemas de Informação (SI)</option>
                <option value="ads">Análise e Des. de Sistemas (ADS)</option>
              </select>
              {createForm.errors.course_id && <p className="text-sm text-red-500">{createForm.errors.course_id}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium text-gray-700">Código da Cadeira</label>
              <Input
                id="code"
                value={createForm.data.code}
                onChange={e => createForm.setData('code', e.target.value)}
                placeholder="Ex: SI101"
                required
              />
              {createForm.errors.code && <p className="text-sm text-red-500">{createForm.errors.code}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">Nome da Disciplina</label>
              <Input
                id="name"
                value={createForm.data.name}
                onChange={e => createForm.setData('name', e.target.value)}
                placeholder="Ex: Engenharia de Software II"
                required
              />
              {createForm.errors.name && <p className="text-sm text-red-500">{createForm.errors.name}</p>}
            </div>
            <DialogFooter className="pt-2">
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
      <Dialog open={!!deletingSubject} onOpenChange={(open) => !open && setDeletingSubject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Disciplina</DialogTitle>
            <DialogDescription className="text-red-600">
              Tem certeza que deseja remover a disciplina <strong>{deletingSubject?.name}</strong> ({deletingSubject?.code})?
            </DialogDescription>
          </DialogHeader>
          <div className="bg-amber-50 p-3 rounded-md mt-2">
            <p className="text-sm text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              Remover a disciplina excluirá permanentemente todas as suas turmas, alunos matriculados e notas associadas. Esta ação é irreversível.
            </p>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setDeletingSubject(null)}>Cancelar</Button>
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
