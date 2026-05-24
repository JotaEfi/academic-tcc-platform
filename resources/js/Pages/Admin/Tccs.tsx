import React from 'react';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
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

      <div className="flex flex-col gap-5 p-4 md:p-6 pt-0 max-w-7xl mx-auto w-full">
        {/* Unified Minimal Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Gerenciar TCCs
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Visualize e gerencie todos os trabalhos de conclusão de curso.</p>
          </div>
          
          <div className="flex items-center gap-2 min-w-[240px]">
            <select
              id="periodFilter"
              value={filters.period || ''}
              onChange={handlePeriodChange}
              className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-white text-xs rounded-lg focus:ring-[#216f7d] focus:border-[#216f7d] py-1.5 px-2.5 font-medium transition-all"
            >
              <option value="">Todos os Períodos</option>
              {availablePeriods.map(period => (
                <option key={period} value={period}>{period}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clean, spacious Card & Table */}
        <Card className="shadow-sm border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-50/50 dark:bg-zinc-800/40 border-b border-gray-100 dark:border-zinc-800 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 w-[10%]">ID</th>
                    <th className="px-5 py-3 w-[10%]">Período</th>
                    <th className="px-5 py-3 w-[30%]">Título</th>
                    <th className="px-5 py-3 w-[15%]">Estudante</th>
                    <th className="px-5 py-3 w-[15%]">Orientador</th>
                    <th className="px-5 py-3 w-[10%]">Avaliadores</th>
                    <th className="px-5 py-3 w-[10%]">Local</th>
                    <th className="px-5 py-3 w-[10%]">Data / Horário</th>
                    <th className="px-5 py-3 text-center w-[5%]">Média</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {tccs.length > 0 ? (
                    tccs.map((tcc) => (
                      <tr key={tcc.id} className="hover:bg-gray-50/30 dark:hover:bg-zinc-800/25 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-gray-400 dark:text-zinc-500 whitespace-nowrap">
                          {tcc.id.split('-')[0]}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#216f7d]/10 text-[#216f7d] dark:bg-[#216f7d]/20 dark:text-[#2dd4bf]">
                            {tcc.period || 'N/A'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-gray-900 dark:text-white leading-relaxed line-clamp-2 max-w-sm">
                            {tcc.title}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-medium text-gray-700 dark:text-gray-300">
                          {tcc.student}
                        </td>
                        <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">
                          {tcc.orientador}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-col gap-1 max-w-[150px]">
                            {Array.isArray(tcc.evaluators) && tcc.evaluators.length > 0 ? (
                              tcc.evaluators.filter(ev => ev !== tcc.orientador).map((ev, idx) => (
                                <span key={idx} className="inline-flex items-center text-[9px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 px-1.5 py-0.2 rounded w-fit truncate">
                                  {ev}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400 dark:text-zinc-600 italic">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-medium text-gray-550 dark:text-gray-400 whitespace-nowrap">
                          {tcc.location}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {tcc.defense_date || tcc.defense_time ? (
                            <div className="flex flex-col">
                              {tcc.defense_date && <span className="font-semibold text-gray-800 dark:text-gray-200">{tcc.defense_date}</span>}
                              {tcc.defense_time && <span className="text-[10px] text-gray-400 dark:text-zinc-500">{tcc.defense_time}</span>}
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-zinc-650 italic">N/A</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-center whitespace-nowrap">
                          {tcc.average !== null ? (
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-black bg-[#216f7d] text-white">
                              {tcc.average}
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-400 dark:bg-zinc-800 dark:text-zinc-500">
                              N/A
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-5 py-8 text-center text-gray-400">
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
