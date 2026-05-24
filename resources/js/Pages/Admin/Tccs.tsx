import React from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

declare global {
  var route: (name: string, params?: any, absolute?: boolean) => string;
}

interface Tcc {
  id: string;
  title: string;
  student: string;
  orientador: string;
  location: string;
  defense_date: string | null;
  defense_time: string | null;
  average: number | null;
  evaluators: string[];
}

export default function TccsPage({ tccs }: { tccs: Tcc[] }) {
  return (
    <AppLayout breadcrumbs={[{ title: 'TCCs', href: route('admin.tccs') }]}>
      <Head title="Gerenciar TCCs" />

      <div className="flex flex-col gap-6 p-4 md:p-8 pt-0">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Gerenciar TCCs</h1>
            <p className="text-sm text-gray-500 mt-1">Visualize e gerencie todos os trabalhos de conclusão de curso cadastrados no sistema</p>
          </div>
          <Button
            onClick={() => window.location.href = route('admin.evaluated_tccs')}
            className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shrink-0"
          >
            <BarChart3 className="w-4 h-4" />
            Ver Resultados
          </Button>
        </div>

        <Card className="shadow-xl border-0 bg-white">
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Título</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Aluno</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Orientador</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Avaliadores</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Local</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Data/Horário</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Média</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tccs.length > 0 ? (
                    tccs.map((tcc) => (
                      <tr key={tcc.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 text-sm text-gray-600">#{tcc.id}</td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{tcc.title}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{tcc.student}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{tcc.orientador}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {Array.isArray(tcc.evaluators) && tcc.evaluators.length > 0 ? (
                            tcc.evaluators.filter(ev => ev !== tcc.orientador).map((ev, idx) => (
                              <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-1">{ev}</span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">{tcc.location}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {tcc.defense_date || tcc.defense_time ? (
                            <div>
                              {tcc.defense_date && <div>{tcc.defense_date}</div>}
                              {tcc.defense_time && (
                                <div className="text-xs text-gray-500">{tcc.defense_time}</div>
                              )}
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {tcc.average !== null ? tcc.average : 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                        Nenhum TCC cadastrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
