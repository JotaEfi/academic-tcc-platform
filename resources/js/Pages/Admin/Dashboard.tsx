import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Upload,
  FileDown,
  QrCode,
  BarChart3,
  Users,
  FolderOpen,
  CheckCircle2,
  ExternalLink,
  Key,
  Printer,
  Download
} from 'lucide-react';

declare global {
  var route: (name: string, params?: any, absolute?: boolean) => string;
}

export default function AdminDashboard({ tccs, professors }: { tccs: any[], professors: any[] }) {
  const [activeTab, setActiveTab] = useState('tccs');

  const { data, setData, post, processing, errors, reset } = useForm({
    csv_file: null as File | null,
  });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setData('csv_file', e.target.files[0]);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('admin.import'), {
      onSuccess: () => {
        reset();
        setSuccessMessage('TCCs importados com sucesso!');
        setTimeout(() => setSuccessMessage(null), 3000);
      },
    });
  };

  // Calcular estatísticas
  const totalTccs = tccs.length;
  const totalProfessors = professors.length;
  const evaluatedTccs = tccs.filter(t => t.evaluations_count > 0).length;
  const totalEvaluations = tccs.reduce((sum, t) => sum + t.evaluations_count, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Head title="Admin Dashboard" />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
              <p className="text-gray-600 mt-1">Gerencie TCCs, professores e avaliações</p>
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de Estatísticas */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="shadow-xl border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de TCCs</CardTitle>
              <FolderOpen className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalTccs}</div>
              <p className="text-xs text-gray-500 mt-1">
                TCCs cadastrados
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
                de {totalTccs} TCCs
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Customizada */}
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-xl border-0 p-1 inline-flex gap-1">
            <button
              onClick={() => setActiveTab('tccs')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'tccs'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              TCCs
            </button>
            <button
              onClick={() => setActiveTab('professors')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'professors'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              Professores
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'import'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              Importar Dados
            </button>
          </div>

          {/* Tab Content - TCCs */}
          {activeTab === 'tccs' && (
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-gray-900">Lista de TCCs</CardTitle>
                    <CardDescription className="mt-1">
                      Visualize e gerencie todos os TCCs cadastrados
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => window.location.href = route('admin.evaluated_tccs')}
                    className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Ver Resultados
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
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
                      {tccs.map((tcc) => (
                        <tr key={tcc.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 text-sm text-gray-600">#{tcc.id}</td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">{tcc.title}</td>
                          <td className="px-4 py-4 text-sm text-gray-600">{tcc.student}</td>
                          <td className="px-4 py-4 text-sm text-gray-600">{tcc.orientador}</td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {/* Exibir avaliadores, exceto orientador */}
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
                              {tcc.average || 'N/A'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab Content - Professores */}
          {activeTab === 'professors' && (
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader>
                <CardTitle className="text-xl">Professores Avaliadores</CardTitle>
                <CardDescription className="mt-1">
                  Credenciais de acesso para os professores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nome</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Senha Temporária</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Link de Acesso</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {professors && professors.length > 0 ? (
                        professors.map((prof) => (
                          <tr key={prof.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4 text-sm font-medium text-gray-900">{prof.name}</td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <Key className="w-4 h-4 text-gray-400" />
                                <span className="font-mono text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded">
                                  {prof.temp_password || 'N/A'}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <a
                                href={route('professor.login')}
                                target="_blank"
                                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                              >
                                <ExternalLink className="w-4 h-4 mr-1" />
                                Página de Login
                              </a>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                            Nenhum professor cadastrado
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab Content - Importar */}
          {activeTab === 'import' && (
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Importar TCCs via CSV</CardTitle>
                <CardDescription className="mt-1">
                  Faça upload de um arquivo CSV com os dados dos TCCs (ID, Título, Aluno, Orientador, Avaliadores, Local, Data/Horário)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {successMessage && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-800 font-medium">{successMessage}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <div className="space-y-2">
                      <label htmlFor="csv_file" className="cursor-pointer">
                        <span className="text-sm text-gray-600">
                          Arraste um arquivo CSV ou{' '}
                          <span className="text-blue-600 hover:text-blue-700 font-medium">
                            clique para selecionar
                          </span>
                        </span>
                      </label>
                      <input
                        id="csv_file"
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                    {data.csv_file && (
                      <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                        <FileDown className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-900 font-medium">
                          {data.csv_file.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {errors.csv_file && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                      {errors.csv_file}
                    </div>
                  )}

                  <Button
                    onClick={submit}
                    disabled={processing || !data.csv_file}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    {processing ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Importando...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4" />
                        Importar TCCs
                      </span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
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
                    // @ts-ignore
                    window.location.href = '#'; // Prevent default
                    // Use inertia form helper if possible or standard submit
                    // Since we are inside a component, let's use the inertia router manually or a form
                    // Creating a temporary form submission for simplicity
                    const form = document.createElement('form');
                    form.method = 'POST';
                    form.action = route('admin.reset');

                    // Add CSRF token if needed, but Inertia usually handles it via headers. 
                    // However, native form submit needs hidden input if not using Inertia router.
                    // Better to use Inertia Router.
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
    </div>
  );
}