import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Key, ExternalLink, Plus, Edit2, Trash2, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

declare global {
  var route: (name: string, params?: any, absolute?: boolean) => string;
}

interface Professor {
  id: number;
  name: string;
  temp_password: string | null;
  access_token: string | null;
}

export default function ProfessorsPage({ professors }: { professors: Professor[] }) {
  const { props } = usePage();
  const flash = props.flash as { success?: string, error?: string } || {};

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const createForm = useForm({ name: '' });

  // Edit Modal State
  const [editingProf, setEditingProf] = useState<Professor | null>(null);
  const editForm = useForm({ name: '' });

  // Delete Modal State
  const [deletingProf, setDeletingProf] = useState<Professor | null>(null);
  const deleteForm = useForm();

  // Handlers
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createForm.post(route('admin.professors.store'), {
      onSuccess: () => {
        setIsCreateOpen(false);
        createForm.reset();
      },
    });
  };

  const openEdit = (prof: Professor) => {
    setEditingProf(prof);
    editForm.setData('name', prof.name);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProf) return;
    editForm.put(route('admin.professors.update', editingProf.id), {
      onSuccess: () => {
        setEditingProf(null);
        editForm.reset();
      },
    });
  };

  const handleDelete = () => {
    if (!deletingProf) return;
    deleteForm.delete(route('admin.professors.destroy', deletingProf.id), {
      onSuccess: () => {
        setDeletingProf(null);
      },
    });
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Professores', href: route('admin.professors') }]}>
      <Head title="Gerenciar Professores" />

      <div className="flex flex-col gap-6 p-4 md:p-8 pt-0">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Gerenciar Professores</h1>
            <p className="text-sm text-gray-500 mt-1">Gerencie os professores avaliadores e orientadores do sistema</p>
          </div>
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-[#216f7d] hover:bg-[#1a5b67] text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Professor
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

        <Card className="shadow-xl border-0 bg-white">
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nome</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Senha Temporária</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acesso</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {professors && professors.length > 0 ? (
                    professors.map((prof) => (
                      <tr key={prof.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{prof.name}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Key className="w-4 h-4 text-gray-400" />
                            <span className="font-mono text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded">
                              {prof.temp_password || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <a
                            href={route('professor.login')}
                            target="_blank"
                            className="inline-flex items-center text-sm text-[#216f7d] hover:text-[#1a5b67] font-medium"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Página de Login
                          </a>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 h-8 px-2"
                              onClick={() => openEdit(prof)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-500 hover:text-red-600 hover:bg-red-50 h-8 px-2"
                              onClick={() => setDeletingProf(prof)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        Nenhum professor cadastrado
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
            <DialogTitle>Novo Professor</DialogTitle>
            <DialogDescription>
              O sistema criará automaticamente um e-mail de acesso e uma senha temporária.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Nome Completo</label>
              <Input
                id="name"
                value={createForm.data.name}
                onChange={e => createForm.setData('name', e.target.value)}
                placeholder="Ex: Prof. Dr. João Silva"
                required
              />
              {createForm.errors.name && <p className="text-sm text-red-500">{createForm.errors.name}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-[#216f7d] hover:bg-[#1a5b67]" disabled={createForm.processing}>
                {createForm.processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog open={!!editingProf} onOpenChange={(open) => !open && setEditingProf(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Professor</DialogTitle>
            <DialogDescription>
              Altere o nome do professor. Isso não mudará o login dele se ele já tiver acessado.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label htmlFor="edit_name" className="text-sm font-medium">Nome Completo</label>
              <Input
                id="edit_name"
                value={editForm.data.name}
                onChange={e => editForm.setData('name', e.target.value)}
                required
              />
              {editForm.errors.name && <p className="text-sm text-red-500">{editForm.errors.name}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingProf(null)}>Cancelar</Button>
              <Button type="submit" className="bg-[#216f7d] hover:bg-[#1a5b67]" disabled={editForm.processing}>
                {editForm.processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Atualizar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE MODAL */}
      <Dialog open={!!deletingProf} onOpenChange={(open) => !open && setDeletingProf(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Professor</DialogTitle>
            <DialogDescription className="text-red-600">
              Tem certeza que deseja excluir o professor <strong>{deletingProf?.name}</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-amber-50 p-3 rounded-md mt-4">
            <p className="text-sm text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              Você só poderá excluir este professor se ele não estiver vinculado a nenhum TCC ativo como orientador ou avaliador.
            </p>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setDeletingProf(null)}>Cancelar</Button>
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
