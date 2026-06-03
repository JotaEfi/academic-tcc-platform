import React from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, GraduationCap, Calendar, BookOpen, ArrowRight } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface Subject {
  id: number;
  code: string;
  name: string;
}

interface OfferingClass {
  id: number;
  subject_id: number;
  period: string;
  name: string;
  enrollments_count: number;
  subject?: Subject;
}

export default function ProfessorClassesPage({ classes = [] }: { classes?: OfferingClass[] }) {
  const { props } = usePage();
  const courseId = (props.course_id as string) || 'si';

  const courseTitle = courseId.toUpperCase() === 'SI' 
    ? 'Sistemas de Informação' 
    : 'Análise e Des. de Sistemas';

  return (
    <AppLayout breadcrumbs={[{ title: 'Minhas Turmas', href: route('professor.classes') }]}>
      <Head title="Minhas Turmas - Portal do Professor" />

      <div className="flex flex-col gap-6 p-4 md:p-8 pt-0">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Minhas Turmas - {courseTitle}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Selecione uma turma para lançar avaliações, configurar fórmulas de médias e registrar as notas dos alunos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes && classes.length > 0 ? (
            classes.map((cls) => (
              <Card key={cls.id} className="shadow-lg hover:shadow-xl border border-gray-100 bg-white rounded-xl overflow-hidden transition-all flex flex-col justify-between">
                <div className="p-6 pb-4">
                  <div className="flex justify-between items-start gap-3">
                    <span className="font-mono text-xs text-[#216f7d] bg-[#216f7d]/10 px-2.5 py-0.5 rounded font-bold uppercase shrink-0">
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
                      <Users className="w-4 h-4 text-cyan-600 shrink-0" />
                      <span><strong>Alunos Matriculados:</strong> {cls.enrollments_count}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-gray-50 bg-gray-50/50 flex">
                  <Link 
                    href={route('professor.classes.grades', cls.id)}
                    className="flex-1 inline-flex items-center justify-center bg-[#216f7d] hover:bg-[#1a5b67] text-white text-sm font-semibold py-2.5 px-4 rounded-lg shadow transition-colors text-center gap-1"
                  >
                    <span>Lançar Notas & Fórmulas</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full bg-white p-12 text-center border border-gray-100 rounded-xl shadow-md text-gray-400">
              <BookOpen className="w-14 h-14 text-gray-200 mx-auto mb-3" />
              Nenhuma turma atribuída a você neste curso para o semestre letivo atual.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
