import React from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  FolderOpen,
  CheckCircle2,
  BarChart3,
  Download
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

declare global {
  var route: (name: string, params?: any, absolute?: boolean) => string;
}

interface Stats {
  totalTccs: number;
  totalProfessors: number;
  evaluatedTccs: number;
  totalEvaluations: number;
}

export default function AdminDashboard({ stats }: { stats: Stats }) {
  const { totalTccs, totalProfessors, evaluatedTccs, totalEvaluations } = stats;

  return (
    <AppLayout breadcrumbs={[{ title: 'Dashboard', href: route('admin.dashboard') }]}>
      <Head title="Admin Dashboard" />

      <div className="flex flex-col gap-6 p-4 md:p-8 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard Administrativo</h1>
            <p className="text-sm text-gray-500 mt-1">Visão geral do sistema de avaliação de TCCs</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => window.location.href = route('admin.export')}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-xl border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de TCCs</CardTitle>
              <FolderOpen className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalTccs}</div>
              <p className="text-xs text-gray-500 mt-1">
                TCCs cadastrados no sistema
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Professores</CardTitle>
              <Users className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalProfessors}</div>
              <p className="text-xs text-gray-500 mt-1">
                Avaliadores cadastrados
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avaliações</CardTitle>
              <BarChart3 className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalEvaluations}</div>
              <p className="text-xs text-gray-500 mt-1">
                Avaliações realizadas
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Projetos Avaliados</CardTitle>
              <CheckCircle2 className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{evaluatedTccs}</div>
              <p className="text-xs text-gray-500 mt-1">
                de {totalTccs} TCCs com notas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Danger Zone */}
        <div className="mt-12 bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-red-900">Zona de Perigo</h3>
              <p className="text-red-700 mt-1">
                Ações destrutivas que não podem ser desfeitas.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm('TEM CERTEZA? Isso apagará TODOS os TCCs, Professores e Avaliações. Apenas o Login Admin será mantido.\n\nEsta ação é irreversível.')) {
                  if (confirm('Confirmação Final: Deseja realmente ZERAR o banco de dados?')) {
                    import('@inertiajs/react').then((inertia) => {
                      inertia.router.post(route('admin.reset'));
                    });
                  }
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              ZERAR BANCO DE DADOS
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}