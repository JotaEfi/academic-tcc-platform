import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  ClipboardList,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  FolderOpen,
  LogOut,
  Calendar
} from 'lucide-react';
import { router } from '@inertiajs/react';

declare global {
  var route: (name: string, params?: any, absolute?: boolean) => string;
}

export default function ProfessorDashboard({ tccs }: { tccs: any[] }) {
  // Count TCCs where both stages are completed
  const fullyEvaluatedCount = tccs.filter(t => t.etapa1_completed && t.etapa2_completed).length;
  const pendingCount = tccs.length - fullyEvaluatedCount;
  const progress = tccs.length > 0 ? (fullyEvaluatedCount / tccs.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Head title="Professor Dashboard" />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gray-900 rounded-xl p-2 sm:p-3">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Painel do Professor</h1>
                <p className="text-xs sm:text-sm text-gray-600">TCCs para avaliação</p>
              </div>
            </div>
            <Button
              onClick={() => router.post(route('professor.logout'))}
              className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="shadow-xl border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Total</CardTitle>
              <FolderOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{tccs.length}</div>
              <p className="text-xs text-gray-500 mt-1">TCCs</p>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Completos</CardTitle>
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{fullyEvaluatedCount}</div>
              <p className="text-xs text-gray-500 mt-1">2 etapas</p>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Pendentes</CardTitle>
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{pendingCount}</div>
              <p className="text-xs text-gray-500 mt-1">Aguardando</p>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Progresso</CardTitle>
              <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{progress.toFixed(0)}%</div>
              <p className="text-xs text-gray-500 mt-1">Concluído</p>
            </CardContent>
          </Card>
        </div>

        {/* Barra de progresso */}
        {tccs.length > 0 && (
          <Card className="shadow-xl border-0 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">Progresso das Avaliações</span>
                <span className="font-bold text-gray-900">{fullyEvaluatedCount}/{tccs.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de TCCs */}
        {tccs.length === 0 ? (
          <Card className="shadow-xl border-0 bg-white">
            <CardContent className="py-16 text-center">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum TCC atribuído
              </h3>
              <p className="text-sm text-gray-500">
                Os TCCs para avaliação aparecerão aqui
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {tccs.map((tcc) => {
              return (
                <Card key={tcc.id} className="shadow-xl border-0 bg-white hover:shadow-2xl transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      {/* Informações do TCC */}
                      <div className="flex-1 space-y-3">
                        {/* Título */}
                        <div>
                          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                            {tcc.title}
                            {tcc.role === 'orientador' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                Orientador
                              </span>
                            )}
                          </h2>

                          {/* Detalhes */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <User className="w-4 h-4 text-gray-400" />
                              <span><span className="font-medium">Aluno:</span> {tcc.student}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <GraduationCap className="w-4 h-4 text-gray-400" />
                              <span><span className="font-medium">Orientador:</span> {tcc.orientador}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span><span className="font-medium">Local:</span> {tcc.location}</span>
                            </div>
                            {tcc.defense_date && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span><span className="font-medium">Defesa:</span> {tcc.defense_date} {tcc.defense_time && `- ${tcc.defense_time}`}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status Etapas */}
                        <div className="flex gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${tcc.etapa1_completed
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                            }`}>
                            {tcc.etapa1_completed ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Etapa 1 ✓
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5" />
                                Etapa 1
                              </>
                            )}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${tcc.etapa2_completed
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                            }`}>
                            {tcc.etapa2_completed ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Etapa 2 ✓
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5" />
                                Etapa 2
                              </>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Ações - Desktop */}
                      <div className="hidden sm:flex flex-col gap-2">
                        {tcc.status === 'closed' && (
                            <div className="bg-red-50 text-red-700 text-xs text-center py-1.5 rounded-md font-semibold border border-red-100 mb-1">
                                Período Encerrado
                            </div>
                        )}
                        <Link href={route('professor.evaluate', tcc.id) + '?stage=etapa1'} className={tcc.status === 'closed' && !tcc.etapa1_completed ? 'pointer-events-none opacity-50' : ''}>
                          <Button className={`w-full ${tcc.etapa1_completed ? 'bg-gray-600' : 'bg-blue-600'} hover:bg-blue-700 text-white`} disabled={tcc.status === 'closed' && !tcc.etapa1_completed}>
                            <ClipboardList className="w-4 h-4 mr-2" />
                            {tcc.etapa1_completed ? 'Ver Etapa 1' : 'Avaliar Etapa 1'}
                          </Button>
                        </Link>
                        <Link href={route('professor.evaluate', tcc.id) + '?stage=etapa2'} className={tcc.status === 'closed' && !tcc.etapa2_completed ? 'pointer-events-none opacity-50' : ''}>
                          <Button className={`w-full ${tcc.etapa2_completed ? 'bg-gray-600' : 'bg-blue-600'} hover:bg-blue-700 text-white`} disabled={tcc.status === 'closed' && !tcc.etapa2_completed}>
                            <ClipboardList className="w-4 h-4 mr-2" />
                            {tcc.etapa2_completed ? 'Ver Etapa 2' : 'Avaliar Etapa 2'}
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Botões - Mobile */}
                    <div className="sm:hidden mt-4 space-y-2">
                      {tcc.status === 'closed' && (
                          <div className="bg-red-50 text-red-700 text-xs text-center py-2 rounded-md font-semibold border border-red-100 mb-2">
                              Período de Avaliação Encerrado
                          </div>
                      )}
                      <Link href={route('professor.evaluate', tcc.id) + '?stage=etapa1'} className={`block ${tcc.status === 'closed' && !tcc.etapa1_completed ? 'pointer-events-none opacity-50' : ''}`}>
                        <Button className={`w-full ${tcc.etapa1_completed ? 'bg-gray-600' : 'bg-blue-600'} hover:bg-blue-700 text-white py-6`} disabled={tcc.status === 'closed' && !tcc.etapa1_completed}>
                          <ClipboardList className="w-5 h-5 mr-2" />
                          {tcc.etapa1_completed ? 'Ver Etapa 1' : 'Avaliar Etapa 1'}
                        </Button>
                      </Link>
                      <Link href={route('professor.evaluate', tcc.id) + '?stage=etapa2'} className={`block ${tcc.status === 'closed' && !tcc.etapa2_completed ? 'pointer-events-none opacity-50' : ''}`}>
                        <Button className={`w-full ${tcc.etapa2_completed ? 'bg-gray-600' : 'bg-blue-600'} hover:bg-blue-700 text-white py-6`} disabled={tcc.status === 'closed' && !tcc.etapa2_completed}>
                          <ClipboardList className="w-5 h-5 mr-2" />
                          {tcc.etapa2_completed ? 'Ver Etapa 2' : 'Avaliar Etapa 2'}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}