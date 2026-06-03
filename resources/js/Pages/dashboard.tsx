import { useState } from 'react';
import { Tab } from '@headlessui/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileDown, QrCode, BarChart3 } from 'lucide-react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Cards superiores */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Projetos cadastrados</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliações</CardTitle>
            <FileDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Avaliações realizadas</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">QR Codes</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">QR Codes gerados</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tab.Group>
        <Tab.List className="flex gap-2 border-b pb-2">
          {['Importar Projetos', 'Gerar QR Codes', 'Resultados'].map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                classNames(
                  'px-4 py-2 text-sm font-medium rounded',
                  selected
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              {tab}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels className="mt-4 space-y-4">
          {/* Importar Projetos */}
          <Tab.Panel>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Importar Projetos via CSV</CardTitle>
                <CardDescription>
                  Faça upload de um arquivo CSV com os dados dos projetos (ID, Título, Líder,
                  Local)
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Arraste um arquivo CSV ou clique para selecionar
                  </p>
                  <Button>Selecionar Arquivo</Button>
                </div>
              </CardContent>
            </Card>
          </Tab.Panel>

          {/* Gerar QR Codes */}
          <Tab.Panel>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Gerar QR Codes</CardTitle>
                <CardDescription>
                  Gere QR codes para todos os projetos importados
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Button className="w-full" disabled>
                  <QrCode className="w-4 h-4 mr-2" />
                  Gerar QR Codes (Importe projetos primeiro)
                </Button>
              </CardContent>
            </Card>
          </Tab.Panel>

          {/* Resultados */}
          <Tab.Panel>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Exportar Resultados</CardTitle>
                <CardDescription>
                  Baixe um CSV com as médias das avaliações dos professores
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Button className="w-full" disabled>
                  <FileDown className="w-4 h-4 mr-2" />
                  Exportar Resultados (Nenhuma avaliação disponível)
                </Button>
              </CardContent>
            </Card>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default AdminDashboard;
