import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  status: 'open' | 'closed';
}

interface Props {
  tccs: Tcc[];
  availablePeriods: string[];
  filters: {
    period: string | null;
  };
}

export default function TccsPage({ tccs, availablePeriods = [], filters = { period: null } }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'open' | 'closed' | null>(null);

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const period = e.target.value;
    router.get(route('admin.tccs'), period ? { period } : {}, { preserveState: true, preserveScroll: true });
    setSelectedIds([]); // Clear selection when filtering
  };

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(tccs.map(t => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const requestStatusUpdate = (status: 'open' | 'closed') => {
    if (selectedIds.length === 0 || isProcessing) return;
    setConfirmAction(status);
  };

  const confirmStatusUpdate = () => {
    if (!confirmAction) return;
    
    setIsProcessing(true);
    router.put('/admin/tccs/status', {
      tcc_ids: selectedIds,
      status: confirmAction
    }, {
      preserveScroll: true,
      onSuccess: () => {
          setSelectedIds([]);
      },
      onFinish: () => {
          setIsProcessing(false);
          setConfirmAction(null);
      }
    });
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'TCCs', href: route('admin.tccs') }]}>
      <Head title="Gerenciar TCCs" />

      {/* Confirmation Dialog */}
      <Dialog open={confirmAction !== null} onOpenChange={(open) => !open && !isProcessing && setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar alteração de status</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja {confirmAction === 'open' ? <strong className="text-emerald-600">ABRIR</strong> : <strong className="text-red-600">ENCERRAR</strong>} a avaliação de {selectedIds.length} TCC(s) selecionado(s)?
              <br />
              {confirmAction === 'open' 
                ? 'Os avaliadores poderão enviar ou alterar suas notas para estes TCCs.' 
                : 'Os avaliadores não poderão mais enviar ou alterar notas para estes TCCs, mas ainda poderão visualizá-las.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)} disabled={isProcessing}>Cancelar</Button>
            <Button 
                onClick={confirmStatusUpdate} 
                disabled={isProcessing}
                className={confirmAction === 'open' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}
            >
                {isProcessing ? 'Processando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-5 p-4 md:p-6 pt-0 max-w-7xl mx-auto w-full">
        {/* Unified Minimal Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Gerenciar TCCs
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Visualize e gerencie todos os trabalhos de conclusão de curso.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-2">
            {selectedIds.length > 0 && (() => {
              const selectedTccsData = tccs.filter(t => selectedIds.includes(t.id));
              const allOpen = selectedTccsData.length > 0 && selectedTccsData.every(t => t.status === 'open');
              const allClosed = selectedTccsData.length > 0 && selectedTccsData.every(t => t.status === 'closed');
              const isMixed = !allOpen && !allClosed;

              return (
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                        {selectedIds.length} selecionado(s)
                    </span>
                    <div className="h-4 w-px bg-gray-300 dark:bg-zinc-600"></div>
                    
                    {isMixed ? (
                        <span className="text-xs text-orange-600 font-medium dark:text-orange-400">
                            Status mistos (Selecione iguais para alterar)
                        </span>
                    ) : (
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => !isProcessing && requestStatusUpdate(allOpen ? 'closed' : 'open')}>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${allOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-zinc-500'}`}>Aberto</span>
                            <div
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${allOpen ? 'bg-emerald-500' : 'bg-red-500'} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <span 
                                    className="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform" 
                                    style={{ transform: allOpen ? 'translateX(4px)' : 'translateX(18px)' }} 
                                />
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${allClosed ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-zinc-500'}`}>Encerrado</span>
                        </div>
                    )}
                </div>
              );
            })()}
            
            <div className="min-w-[200px]">
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
        </div>

        {/* Clean, spacious Card & Table */}
        <Card className="shadow-sm border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-50/50 dark:bg-zinc-800/40 border-b border-gray-100 dark:border-zinc-800 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 w-[40px] text-center">
                        <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-[#216f7d] focus:ring-[#216f7d]"
                            checked={tccs.length > 0 && selectedIds.length === tccs.length}
                            onChange={toggleSelectAll}
                        />
                    </th>
                    <th className="px-5 py-3 w-[10%]">ID</th>
                    <th className="px-5 py-3 w-[10%]">Status / Período</th>
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
                      <tr key={tcc.id} className={`hover:bg-gray-50/30 dark:hover:bg-zinc-800/25 transition-colors ${selectedIds.includes(tcc.id) ? 'bg-[#216f7d]/5 dark:bg-[#216f7d]/10' : ''}`}>
                        <td className="px-5 py-3.5 text-center">
                            <input 
                                type="checkbox" 
                                className="rounded border-gray-300 text-[#216f7d] focus:ring-[#216f7d]"
                                checked={selectedIds.includes(tcc.id)}
                                onChange={() => toggleSelect(tcc.id)}
                            />
                        </td>
                        <td className="px-5 py-3.5 font-mono text-gray-400 dark:text-zinc-500 whitespace-nowrap">
                          {tcc.id.split('-')[0]}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap flex flex-col gap-1 items-start">
                          <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold ${tcc.status === 'open' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                            {tcc.status === 'open' ? 'ABERTO' : 'ENCERRADO'}
                          </span>
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
                      <td colSpan={10} className="px-5 py-8 text-center text-gray-400">
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
