import React from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, ExternalLink } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

declare global {
  var route: (name: string, params?: any, absolute?: boolean) => string;
}

interface Professor {
  id: number;
  name: string;
  temp_password: string | null;
  access_token: string | null;
}

export default function ProfessorsPage({ professors }: { professors: Professor[] }) {
  return (
    <AppLayout breadcrumbs={[{ title: 'Professores', href: route('admin.professors') }]}>
      <Head title="Gerenciar Professores" />

      <div className="flex flex-col gap-6 p-4 md:p-8 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Gerenciar Professores</h1>
            <p className="text-sm text-gray-500 mt-1">Credenciais de acesso temporárias e links para login dos professores avaliadores no sistema</p>
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-white">
          <CardContent className="pt-6">
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
      </div>
    </AppLayout>
  );
}
