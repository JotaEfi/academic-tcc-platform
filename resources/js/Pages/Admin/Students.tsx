import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  GraduationCap,
  Upload,
  BookOpen,
  User,
  Mail,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  Eye,
  FileSpreadsheet
} from 'lucide-react';

interface Course {
  id: string;
  name: string;
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
  subject: {
    code: string;
    name: string;
    course_id: string;
  } | null;
  professor: {
    name: string;
    email: string;
  } | null;
  evaluations: Evaluation[];
  formula: string | null;
  final_average: number | null;
  status: string;
}

interface Student {
  id: number;
  name: string;
  email: string;
  course_id: string | null;
  course: Course | null;
  enrollments: Enrollment[];
}

export default function StudentsPage({ students = [], courses = [] }: { students?: Student[], courses?: Course[] }) {
  const { props } = usePage();
  const flash = props.flash as { success?: string, error?: string } || {};

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');

  // Drawer (Detail Sheet) State
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Manual Create/Edit Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  const studentForm = useForm({
    name: '',
    email: '',
    course_id: 'si',
    password: '',
  });

  // CSV Upload State
  const [isCsvOpen, setIsCsvOpen] = useState(false);
  const csvForm = useForm({
    csv_file: null as File | null,
  });

  // Delete State
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const deleteForm = useForm();

  // Handlers
  const handleOpenCreate = () => {
    setEditingStudent(null);
    studentForm.setData({
      name: '',
      email: '',
      course_id: 'si',
      password: '',
    });
    studentForm.clearErrors();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    studentForm.setData({
      name: student.name,
      email: student.email,
      course_id: student.course_id || 'si',
      password: '',
    });
    studentForm.clearErrors();
    setIsFormOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      studentForm.put(route('admin.students.update', editingStudent.id), {
        onSuccess: () => {
          setIsFormOpen(false);
          studentForm.reset();
        }
      });
    } else {
      studentForm.post(route('admin.students.store'), {
        onSuccess: () => {
          setIsFormOpen(false);
          studentForm.reset();
        }
      });
    }
  };

  const handleDeleteStudent = () => {
    if (!deletingStudent) return;
    deleteForm.delete(route('admin.students.destroy', deletingStudent.id), {
      onSuccess: () => {
        setDeletingStudent(null);
        if (selectedStudent?.id === deletingStudent.id) {
          setSelectedStudent(null);
        }
      }
    });
  };

  const handleCsvImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvForm.data.csv_file) return;

    csvForm.post(route('admin.students.import'), {
      onSuccess: () => {
        setIsCsvOpen(false);
        csvForm.reset();
      }
    });
  };

  // Filter and Search logic
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = selectedCourseId === 'all' || student.course_id === selectedCourseId;

    return matchesSearch && matchesCourse;
  });

  // Group enrollments of selected student by period
  const groupEnrollmentsByPeriod = (enrollments: Enrollment[]) => {
    const grouped: { [key: string]: Enrollment[] } = {};
    enrollments.forEach(enrollment => {
      const period = enrollment.period || 'Sem Período';
      if (!grouped[period]) {
        grouped[period] = [];
      }
      grouped[period].push(enrollment);
    });
    return grouped;
  };

  const selectedStudentGrouped = selectedStudent ? groupEnrollmentsByPeriod(selectedStudent.enrollments) : {};

  return (
    <AppLayout breadcrumbs={[{ title: 'Cadastro de Alunos', href: route('admin.students') }]}>
      <Head title="Cadastro de Alunos" />

      <div className="flex flex-col gap-6 p-4 md:p-8 pt-0">
        {/* Header Section */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Cadastro de Alunos
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Gerencie a base de dados de alunos para os cursos de SI e ADS, importe dados e consulte boletins históricos.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsCsvOpen(true)}
              variant="outline"
              className="border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Importar CSV
            </Button>
            <Button 
              onClick={handleOpenCreate}
              className="bg-[#216f7d] hover:bg-[#1a5b67] text-white flex items-center gap-2 shadow"
            >
              <Plus className="w-4 h-4" />
              Novo Aluno
            </Button>
          </div>
        </div>

        {/* Flash Messages */}
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

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            <Button
              variant={selectedCourseId === 'all' ? 'default' : 'ghost'}
              onClick={() => setSelectedCourseId('all')}
              className={selectedCourseId === 'all' ? 'bg-[#216f7d] hover:bg-[#1a5b67] text-white' : 'text-gray-500 hover:text-[#216f7d]'}
              size="sm"
            >
              Todos
            </Button>
            {courses.map(course => (
              <Button
                key={course.id}
                variant={selectedCourseId === course.id ? 'default' : 'ghost'}
                onClick={() => setSelectedCourseId(course.id)}
                className={selectedCourseId === course.id ? 'bg-[#216f7d] hover:bg-[#1a5b67] text-white' : 'text-gray-500 hover:text-[#216f7d]'}
                size="sm"
              >
                {course.name}
              </Button>
            ))}
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 bg-gray-50/50 border-gray-200"
            />
          </div>
        </div>

        {/* Students Table */}
        <Card className="shadow-lg border-0 bg-white">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/40 text-gray-500">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Aluno</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Curso</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Matrículas</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr 
                        key={student.id} 
                        className="hover:bg-gray-50/30 transition-colors group cursor-pointer"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#216f7d]/10 flex items-center justify-center text-[#216f7d] font-bold text-sm">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 group-hover:text-[#216f7d] transition-colors">{student.name}</p>
                              <p className="text-xs text-gray-500">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {student.course ? (
                            <span className="font-medium text-gray-800">
                              {student.course.name}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">Não associado</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center text-sm">
                          <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full font-semibold text-xs">
                            {student.enrollments.length}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-500 hover:text-[#216f7d] hover:bg-gray-100"
                              onClick={() => setSelectedStudent(student)}
                              title="Visualizar Boletim"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-500 hover:text-[#216f7d] hover:bg-gray-100"
                              onClick={() => handleOpenEdit(student)}
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => setDeletingStudent(student)}
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center text-gray-400">
                        <GraduationCap className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                        Nenhum aluno cadastrado ou correspondente à busca.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CREATE & EDIT FORM MODAL */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingStudent ? 'Editar Aluno' : 'Novo Aluno'}</DialogTitle>
            <DialogDescription>
              {editingStudent ? 'Atualize as informações de cadastro deste aluno.' : 'Cadastre um novo aluno manualmente no sistema.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveStudent} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  value={studentForm.data.name}
                  onChange={e => studentForm.setData('name', e.target.value)}
                  placeholder="Nome do aluno"
                  className="pl-9"
                  required
                />
              </div>
              {studentForm.errors.name && <p className="text-sm text-red-500">{studentForm.errors.name}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">E-mail Institucional</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={studentForm.data.email}
                  onChange={e => studentForm.setData('email', e.target.value)}
                  placeholder="exemplo@faculdade.com"
                  className="pl-9"
                  required
                />
              </div>
              {studentForm.errors.email && <p className="text-sm text-red-500">{studentForm.errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="course" className="text-sm font-medium text-gray-700">Curso Principal</label>
              <select
                id="course"
                value={studentForm.data.course_id}
                onChange={e => studentForm.setData('course_id', e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
              {studentForm.errors.course_id && <p className="text-sm text-red-500">{studentForm.errors.course_id}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="pass" className="text-sm font-medium text-gray-700">Senha (Opcional)</label>
              <Input
                id="pass"
                type="password"
                value={studentForm.data.password}
                onChange={e => studentForm.setData('password', e.target.value)}
                placeholder={editingStudent ? "Deixe em branco para não alterar" : "Senha padrão (inicial será 'password')"}
              />
              {studentForm.errors.password && <p className="text-sm text-red-500">{studentForm.errors.password}</p>}
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-[#216f7d] hover:bg-[#1a5b67] text-white" disabled={studentForm.processing}>
                {studentForm.processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CSV IMPORT MODAL */}
      <Dialog open={isCsvOpen} onOpenChange={setIsCsvOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Importar Alunos por Lote</DialogTitle>
            <DialogDescription>
              Selecione um arquivo CSV para carregar e cadastrar múltiplos alunos de uma só vez.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCsvImport} className="space-y-4 pt-4">
            <div className="bg-[#216f7d]/5 p-4 rounded-xl border border-[#216f7d]/20 text-xs text-slate-700 space-y-2">
              <p className="font-bold text-[#216f7d] flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4" />
                Estrutura do CSV necessária:
              </p>
              <p>O cabeçalho do arquivo deve conter:</p>
              <pre className="bg-white/80 p-2 rounded text-slate-800 font-mono select-all">
                nome,email,curso_id
              </pre>
              <p className="text-slate-500 mt-1">
                * O campo <code>curso_id</code> é opcional. Se omitido, o sistema cadastrará o aluno no curso padrão <strong>SI (Sistemas de Informação)</strong>.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="csv" className="text-sm font-medium text-gray-700">Arquivo CSV</label>
              <Input
                id="csv"
                type="file"
                accept=".csv,.txt"
                onChange={e => csvForm.setData('csv_file', e.target.files ? e.target.files[0] : null)}
                required
              />
              {csvForm.errors.csv_file && <p className="text-sm text-red-500">{csvForm.errors.csv_file}</p>}
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCsvOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-[#216f7d] hover:bg-[#1a5b67] text-white" disabled={csvForm.processing}>
                {csvForm.processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Carregar Arquivo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE MODAL */}
      <Dialog open={!!deletingStudent} onOpenChange={(open) => !open && setDeletingStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Aluno</DialogTitle>
            <DialogDescription className="text-red-600">
              Tem certeza que deseja remover o cadastro do aluno <strong>{deletingStudent?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="bg-amber-50 p-3 rounded-md mt-2">
            <p className="text-sm text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              Esta ação removerá permanentemente o aluno da base. Todas as suas notas, boletins históricos e turmas associadas serão deletados de forma definitiva.
            </p>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setDeletingStudent(null)}>Cancelar</Button>
            <Button type="button" variant="destructive" onClick={handleDeleteStudent} disabled={deleteForm.processing}>
              {deleteForm.processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Confirmar Exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* STUDENT DETAIL SHEET (TRANSCRIPT / BOLETIM OVERLAY) */}
      <Sheet open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        <SheetContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl w-full overflow-y-auto bg-slate-50 border-l border-slate-200 p-0">
          <SheetHeader className="bg-white p-6 border-b border-slate-200 shadow-sm pr-16">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#216f7d]/10 flex items-center justify-center text-[#216f7d] font-bold text-lg border border-[#216f7d]/20 shrink-0">
                {selectedStudent?.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <SheetTitle className="text-xl font-bold text-slate-800">{selectedStudent?.name}</SheetTitle>
                  <Badge className="bg-[#216f7d]/10 text-[#216f7d] border border-[#216f7d]/25 text-[10px] px-2.5 py-0.5 font-bold rounded-full uppercase shrink-0">
                    {selectedStudent?.course?.id.toUpperCase() || 'N/A'}
                  </Badge>
                </div>
                <SheetDescription className="text-slate-500 font-medium text-xs mt-1">
                  {selectedStudent?.email}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-slate-400" />
                Histórico Acadêmico de Notas
              </h3>

              {selectedStudent && selectedStudent.enrollments.length > 0 ? (
                Object.keys(selectedStudentGrouped).map(period => (
                  <div key={period} className="space-y-4 mb-8">
                    <h4 className="text-sm font-bold text-[#216f7d] bg-[#216f7d]/5 px-3 py-1.5 rounded-lg border border-[#216f7d]/15 inline-block">
                      Período Letivo: {period}
                    </h4>

                    {selectedStudentGrouped[period].map(enrollment => (
                      <Card key={enrollment.enrollment_id} className="shadow-md border-0 bg-white overflow-hidden">
                        {/* Class Header */}
                        <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
                          <div>
                            <span className="font-mono text-[10px] text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded font-bold mr-2 uppercase">
                              {enrollment.subject?.code || 'CADEIRA'}
                            </span>
                            <span className="text-sm font-bold text-slate-800">
                              {enrollment.subject?.name || enrollment.class_name}
                            </span>
                            {enrollment.professor && (
                              <p className="text-xs text-gray-500 mt-1">
                                Professor: <span className="font-medium text-gray-700">{enrollment.professor.name}</span> ({enrollment.professor.email})
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Média Final</p>
                              <p className="text-base font-extrabold text-slate-800">
                                {enrollment.final_average !== null ? Number(enrollment.final_average).toFixed(1) : '—'}
                              </p>
                            </div>
                            <Badge 
                              className={
                                enrollment.status === 'aprovado'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold capitalize'
                                  : enrollment.status === 'reprovado'
                                    ? 'bg-red-50 text-red-700 border border-red-200 font-bold capitalize'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200 font-bold capitalize'
                              }
                            >
                              {enrollment.status}
                            </Badge>
                          </div>
                        </div>

                        {/* Grades list */}
                        <CardContent className="p-0">
                          {enrollment.evaluations.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="bg-slate-50/40 text-gray-400 border-b border-slate-100">
                                    <th className="px-5 py-2.5 text-left font-semibold text-gray-500 uppercase tracking-wider w-1/3">Avaliação</th>
                                    <th className="px-5 py-2.5 text-center font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                                    <th className="px-5 py-2.5 text-right font-semibold text-gray-500 uppercase tracking-wider">Nota Registrada</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {enrollment.evaluations.map(evalItem => (
                                    <tr key={evalItem.id} className="hover:bg-slate-50/20">
                                      <td className="px-5 py-3 font-semibold text-slate-800">{evalItem.name}</td>
                                      <td className="px-5 py-3 text-center capitalize text-slate-600">{evalItem.type}</td>
                                      <td className="px-5 py-3 text-right font-bold text-slate-800">
                                        {evalItem.score !== null ? (
                                          <span>
                                            {Number(evalItem.score).toFixed(1)} <span className="text-[10px] text-gray-400 font-medium">/ {evalItem.max_score}</span>
                                          </span>
                                        ) : (
                                          <span className="text-gray-400 font-normal italic">Sem nota</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="px-5 py-6 text-center text-xs text-gray-400 italic">
                              Nenhum critério de avaliação configurado para esta turma.
                            </div>
                          )}

                          {/* Formula block */}
                          {enrollment.formula && (
                            <div className="bg-slate-50/50 p-4 border-t border-slate-100 flex items-center justify-between gap-4">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                                Fórmula de Cálculo
                              </span>
                              <span className="font-mono text-xs font-semibold text-[#216f7d] bg-[#216f7d]/5 px-2.5 py-1 rounded-md border border-[#216f7d]/15">
                                {enrollment.formula}
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-slate-150">
                  <GraduationCap className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  Nenhuma matrícula ativa ou histórico de notas registrado para este aluno.
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}
