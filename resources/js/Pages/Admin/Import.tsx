import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

declare global {
  var route: (name: string, params?: any, absolute?: boolean) => string;
}

export default function ImportPage() {
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

  return (
    <AppLayout breadcrumbs={[{ title: 'Importar Dados', href: route('admin.import_show') }]}>
      <Head title="Importar TCCs" />

      <div className="flex flex-col gap-6 p-4 md:p-8 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Importar Dados</h1>
            <p className="text-sm text-gray-500 mt-1">
              Faça upload de um arquivo CSV com os dados dos TCCs (ID, Título, Aluno, Orientador, Avaliadores, Local, Data/Horário) para cadastrar os trabalhos e gerar as credenciais dos professores.
            </p>
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-white">
          <CardContent className="space-y-4 pt-6">
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
                  <div className="mt-4 p-2 bg-blue-50 border border-blue-100 rounded-lg inline-block">
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
      </div>
    </AppLayout>
  );
}
