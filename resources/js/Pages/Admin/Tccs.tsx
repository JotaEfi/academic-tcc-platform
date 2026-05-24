import React from 'react';
import { Head, router } from '@inertiajs/react';
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
  period: string | null;
}

interface Props {
  tccs: Tcc[];
  availablePeriods: string[];
  filters: {
    period: string | null;
  };
}

export default function TccsPage({ tccs, availablePeriods = [], filters = { period: null } }: Props) {
  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const period = e.target.value;
    router.get(route('admin.tccs'), period ? { period } : {}, { preserveState: true, preserveScroll: true });
  };
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

        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <label htmlFor="periodFilter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Filtrar por Período letivo:
          </label>
          <select
            id="periodFilter"
            value={filters.period || ''}
            onChange={handlePeriodChange}
            className="w-full sm:w-64 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#216f7d] focus:border-[#216f7d] block p-2.5"
          >
            <option value="">Todos os períodos</option>
            {availablePeriods.map(period => (
              <option key={period} value={period}>{period}</option>
            ))}
          </select>
        </div>

        <Card className="shadow-xl border-0 bg-white">
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Período</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[35%]">Título</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Aluno</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Orientador</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Avaliadores</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Local</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Data / Horário</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Média</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tccs.length > 0 ? (
                    tccs.map((tcc) => (
                      <tr key={tcc.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-500 font-mono whitespace-nowrap">
                            {tcc.id.split('-')[0]}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-[#216f7d]/10 text-[#216f7d]">
                                {tcc.period || 'N/A'}
                            </span>
                        </td>
                        <td className="px-4 py-3">
                            <div className="text-sm font-semibold text-gray-900 leading-tight min-w-[250px]">
                                {tcc.title}
                            </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 leading-snug">
                            {tcc.student}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 leading-snug">
                            {tcc.orientador}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                          {Array.isArray(tcc.evaluators) && tcc.evaluators.length > 0 ? (
                            tcc.evaluators.filter(ev => ev !== tcc.orientador).map((ev, idx) => (
                              <span key={idx} className="inline-flex items-center text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm whitespace-nowrap w-fit">
                                {ev}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap font-medium">
                            {tcc.location}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {tcc.defense_date || tcc.defense_time ? (
                            <div className="flex flex-col">
                              {tcc.defense_date && <span className="text-sm font-medium text-gray-900">{tcc.defense_date}</span>}
                              {tcc.defense_time && <span className="text-xs text-gray-500">{tcc.defense_time}</span>}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          {tcc.average !== null ? (
                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-sm font-bold bg-[#216f7d] text-white min-w-[40px]">
                                {tcc.average}
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-500">
                                N/A
                            </span>
                          )}
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
