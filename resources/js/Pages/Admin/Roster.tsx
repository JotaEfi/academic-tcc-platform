import React, { useState, useRef } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, AlertCircle, CheckCircle, Loader2, ArrowLeft, Users, UploadCloud, FileType } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface Subject {
  id: number;
  code: string;
  name: string;
}

interface Professor {
  id: number;
  name: string;
}

interface Student {
  id: number;
  name: string;
  email: string;
}

interface OfferingClass {
  id: number;
  subject_id: number;
  professor_id: number;
  period: string;
  name: string;
  subject?: Subject;
  professor?: Professor;
}

interface Enrollment {
  id: number;
  student_id: number;
  status: string;
  student?: Student;
}

export default function RosterPage({ 
  class: cls, 
  enrollments = [], 
  students = [] 
}: { 
  class: OfferingClass; 
  enrollments?: Enrollment[]; 
  students?: Student[];
}) {
  const { props } = usePage();
  const flash = props.flash as { success?: string, error?: string } || {};

  // Roster enrollment form
  const enrollForm = useForm({
    student_id: students[0]?.id || ''
  });

  // CSV upload form
  const csvForm = useForm({
    csv_file: null as File | null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // handlers
  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollForm.data.student_id) return;
    enrollForm.post(route('admin.classes.roster.store', cls.id), {
      onSuccess: () => {
        enrollForm.reset('student_id');
      }
    });
  };

  const handleUnenroll = (studentId: number) => {
    if (confirm('Tem certeza que deseja desmatricular este aluno?')) {
      router.delete(route('admin.classes.roster.destroy', [cls.id, studentId]));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        csvForm.setData('csv_file', file);
      } else {
        alert('Por favor, selecione apenas arquivos CSV.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      csvForm.setData('csv_file', e.target.files[0]);
    }
  };

  const handleCSVSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvForm.data.csv_file) return;
    csvForm.post(route('admin.classes.roster.import', cls.id), {
      onSuccess: () => {
        csvForm.reset();
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    });
  };

  return (
    <AppLayout breadcrumbs={[
      { title: 'Turmas', href: route('admin.classes') },
      { title: 'Alunos da Turma', href: route('admin.classes.roster', cls.id) }
    ]}>
      <Head title={`Relação de Alunos - ${cls.subject?.name}`} />

      <div className="flex flex-col gap-6 p-4 md:p-8 pt-0">
        <div className="flex items-center gap-4">
          <Link 
            href={route('admin.classes')}
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
              <span>Professor Responsável: <strong>{cls.professor?.name}</strong></span>
              <span>•</span>
              <span>Período: <strong>{cls.period}</strong></span>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enroll & Import Panel */}
          <div className="space-y-6">
            {/* Manual Enroll Form */}
            <Card className="shadow-lg border-0 bg-white rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-900">Matrícula Individual</CardTitle>
                <CardDescription>Selecione um aluno já cadastrado para matriculá-lo nesta turma.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEnroll} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="student_select" className="text-xs font-semibold text-gray-500 uppercase">Selecione o Aluno</label>
                    <select
                      id="student_select"
                      value={enrollForm.data.student_id}
                      onChange={e => enrollForm.setData('student_id', e.target.value)}
                      className="w-full flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#216f7d] focus:border-transparent transition-shadow cursor-pointer"
                      required
                    >
                      <option value="">Selecione...</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                      ))}
                    </select>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-[#216f7d] hover:bg-[#1a5b67] text-white flex items-center justify-center gap-2"
                    disabled={!enrollForm.data.student_id || enrollForm.processing}
                  >
                    <Plus className="w-4 h-4" />
                    Matricular Aluno
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* CSV Import Form */}
            <Card className="shadow-lg border-0 bg-white rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-900">Importação em Lote (.csv)</CardTitle>
                <CardDescription>Matricule múltiplos alunos de uma vez enviando um arquivo CSV com cabeçalho `NOME,EMAIL`.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCSVSubmit} className="space-y-4">
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors cursor-pointer min-h-[140px]
                      ${isDragging ? 'border-[#216f7d] bg-[#216f7d]/5' : 'border-gray-200 hover:border-cyan-500 hover:bg-gray-50'}
                      ${csvForm.data.csv_file ? 'border-emerald-400 bg-emerald-50/20' : ''}
                    `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".csv, text/csv"
                      onChange={handleFileChange}
                    />
                    
                    {!csvForm.data.csv_file ? (
                      <>
                        <UploadCloud className="w-8 h-8 text-[#216f7d] mb-2" />
                        <p className="text-xs font-semibold text-gray-600 text-center">Arraste o arquivo ou clique aqui</p>
                        <p className="text-[10px] text-gray-400 mt-1">Formato suportado: .csv</p>
                      </>
                    ) : (
                      <>
                        <FileType className="w-8 h-8 text-emerald-600 mb-2" />
                        <p className="text-xs font-bold text-emerald-800 text-center max-w-[200px] truncate">
                          {csvForm.data.csv_file.name}
                        </p>
                        <p className="text-[10px] text-emerald-600 mt-0.5">
                          {(csvForm.data.csv_file.size / 1024).toFixed(1)} KB
                        </p>
                      </>
                    )}
                  </div>
                  {csvForm.errors.csv_file && <p className="text-xs text-red-500">{csvForm.errors.csv_file}</p>}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-[#2F506C] hover:bg-[#20374b] text-white"
                    disabled={!csvForm.data.csv_file || csvForm.processing}
                  >
                    {csvForm.processing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      'Matricular via CSV'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Roster Table List */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-white rounded-xl">
              <CardHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-gray-900">Lista de Alunos Matriculados</CardTitle>
                  <CardDescription>Relação de todos os diários de classe para esta turma.</CardDescription>
                </div>
                <span className="bg-[#216f7d]/10 text-[#216f7d] font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                  <Users className="w-3.5 h-3.5" />
                  {enrollments.length} alunos
                </span>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Aluno</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">E-mail</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Média Final</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {enrollments && enrollments.length > 0 ? (
                        enrollments.map((e) => (
                          <tr key={e.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-4 text-sm font-semibold text-gray-900">{e.student?.name}</td>
                            <td className="px-4 py-4 text-sm text-gray-600 font-mono">{e.student?.email}</td>
                            <td className="px-4 py-4">
                              <span className="font-mono text-sm font-bold text-gray-800">
                                {e.final_average !== null ? e.final_average : '—'}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize
                                ${e.status === 'aprovado' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : ''}
                                ${e.status === 'reprovado' ? 'bg-red-50 text-red-800 border border-red-200' : ''}
                                ${e.status === 'cursando' ? 'bg-blue-50 text-blue-800 border border-blue-200' : ''}
                              `}>
                                {e.status}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleUnenroll(e.student_id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                            Nenhum aluno matriculado nesta turma até o momento.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// Helper Inertia import Router
import { router } from '@inertiajs/react';
