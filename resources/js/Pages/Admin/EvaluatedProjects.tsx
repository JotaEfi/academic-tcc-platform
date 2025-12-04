import React from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Award,
  TrendingUp,
  Star,
  CheckCircle2
} from 'lucide-react';

declare global {
  var route: (name: string, params?: any, absolute?: boolean) => string;
}

interface Project {
  id: string;
  title: string;
  leader: string;
  location: string;
  average_grade: number;
}

export default function EvaluatedProjects({ projects }: { projects: Project[] }) {
  // Calcular estatísticas
  const totalEvaluated = projects.length;
  const averageOfAverages = projects.length > 0
    ? (projects.reduce((sum, p) => sum + p.average_grade, 0) / projects.length).toFixed(2)
    : '0.00';
  const highestGrade = projects.length > 0
    ? Math.max(...projects.map(p => p.average_grade)).toFixed(2)
    : '0.00';
  const topProjects = projects.filter(p => p.average_grade >= 8).length;

  // Função para determinar a cor da nota
  const getGradeColor = (grade: number) => {
    if (grade >= 9) return 'bg-green-100 text-green-800';
    if (grade >= 7) return 'bg-blue-100 text-blue-800';
    if (grade >= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head title="Evaluated Projects" />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Projetos Avaliados</h1>
              <p className="text-gray-600 mt-1">Visualize as médias das avaliações dos projetos</p>
            </div>
            <Button
              onClick={() => window.location.href = route('admin.dashboard')}
              className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de Estatísticas */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="shadow-xl border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Avaliados</CardTitle>
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalEvaluated}</div>
              <p className="text-xs text-gray-500 mt-1">
                Projetos com avaliação
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Média Geral</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{averageOfAverages}</div>
              <p className="text-xs text-gray-500 mt-1">
                Média de todas as notas
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Maior Nota</CardTitle>
              <Award className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{highestGrade}</div>
              <p className="text-xs text-gray-500 mt-1">
                Melhor desempenho
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Projetos Top</CardTitle>
              <Star className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{topProjects}</div>
              <p className="text-xs text-gray-500 mt-1">
                Nota ≥ 8.0
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Projetos */}
        <Card className="shadow-xl border-0 bg-white">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Resultados das Avaliações</CardTitle>
            <CardDescription className="mt-1">
              Lista completa de projetos avaliados com suas médias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Projeto</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Líder</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Local</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Média</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {projects.length > 0 ? (
                    projects.map((project) => (
                      <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 text-sm text-gray-600">#{project.id}</td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{project.title}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{project.leader}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{project.location}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getGradeColor(project.average_grade)}`}>
                              {project.average_grade.toFixed(2)}
                            </span>
                            {project.average_grade >= 9 && (
                              <Award className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <CheckCircle2 className="w-12 h-12 mb-3 text-gray-300" />
                          <p className="text-lg font-medium text-gray-900">Nenhum projeto avaliado</p>
                          <p className="text-sm mt-1 text-gray-600">Os projetos avaliados aparecerão aqui</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Legenda de Cores */}
        {projects.length > 0 && (
          <Card className="shadow-xl border-0 bg-white mt-6">
            <CardHeader>
              <CardTitle className="text-sm text-gray-900">Legenda de Notas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded bg-green-100 border-2 border-green-800"></span>
                  <span className="text-sm text-gray-600">Excelente (9.0 - 10.0)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded bg-blue-100 border-2 border-blue-800"></span>
                  <span className="text-sm text-gray-600">Bom (7.0 - 8.9)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded bg-yellow-100 border-2 border-yellow-800"></span>
                  <span className="text-sm text-gray-600">Regular (5.0 - 6.9)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded bg-red-100 border-2 border-red-800"></span>
                  <span className="text-sm text-gray-600">
                    Insuficiente ({'< 5.0'})
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}