import React from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft, Scissors } from 'lucide-react';

declare global {
  var route: (name: string, params?: any, absolute?: boolean) => string;
}

interface QrCodeItem {
  project: {
    id: number;
    title: string;
    leader: string;
    location: string;
  };
  qr: string; // SVG string
  url: string;
}

export default function QrCodes({ qrCodes }: { qrCodes: QrCodeItem[] }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head title="Project QR Codes" />

      {/* Header - Não imprime */}
      <div className="no-print bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">QR Codes dos Projetos</h1>
              <p className="text-gray-600 mt-1">
                Imprima e recorte os QR codes para distribuir aos alunos
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => window.location.href = route('admin.dashboard')}
                className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <Button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white"
              >
                <Printer className="w-4 h-4" />
                Imprimir / Salvar PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Instruções - Não imprime */}
      <div className="no-print max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <Scissors className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-1">Instruções de Impressão</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Configure a impressora para papel A4</li>
              <li>• Use o modo paisagem (landscape) para melhor aproveitamento</li>
              <li>• Recorte ao longo das linhas tracejadas</li>
              <li>• Cada QR code contém o link direto para avaliação do projeto</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Grid de QR Codes - Otimizado para impressão */}
      <div className="print-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-0">
          {qrCodes.map((item) => (
            <div
              key={item.project.id}
              className="qr-card bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center text-center shadow-sm print:shadow-none print:rounded-none print:border-gray-400 print:m-2 page-break-inside-avoid"
            >
              {/* ID do Projeto */}
              <div className="w-full flex justify-between items-center mb-4 print:mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Projeto #{item.project.id}
                </span>
                <Scissors className="w-4 h-4 text-gray-300 print:hidden" />
              </div>

              {/* Título do Projeto */}
              <h2 className="text-xl font-bold text-gray-900 mb-2 print:text-lg print:mb-1">
                {item.project.title}
              </h2>

              {/* Informações */}
              <div className="space-y-1 mb-4 w-full print:mb-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Líder:</span> {item.project.leader}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Local:</span> {item.project.location}
                </p>
              </div>

              {/* QR Code */}
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4 print:p-2 print:mb-2">
                <img
                  src={item.qr}
                  alt={`QR Code for ${item.project.title}`}
                  className="w-48 h-48 print:w-40 print:h-40"
                />
              </div>

              {/* Instruções */}
              <div className="bg-gray-50 rounded-lg p-3 w-full print:p-2">
                <p className="text-xs font-semibold text-gray-700 mb-1 print:text-[10px]">
                  📱 Escaneie para avaliar este projeto
                </p>
                <p className="text-xs text-gray-500 break-all print:text-[8px]">
                  {item.url}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rodapé - Não imprime */}
      <div className="no-print max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">
            Total de <span className="font-bold text-gray-900">{qrCodes.length}</span> QR codes gerados
          </p>
        </div>
      </div>

      {/* Estilos para impressão */}
      <style>{`
        @media print {
          /* Esconder elementos que não devem ser impressos */
          .no-print {
            display: none !important;
          }

          /* Configurações gerais de impressão */
          body {
            margin: 0;
            padding: 0;
            background: white !important;
          }

          /* Container de impressão */
          .print-container {
            max-width: 100%;
            padding: 10mm;
          }

          /* Evitar quebra de página dentro do card */
          .page-break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          /* Cards de QR Code otimizados */
          .qr-card {
            margin: 5mm;
            padding: 8mm;
            border: 2px dashed #666 !important;
            background: white !important;
          }

          /* Remover sombras e efeitos */
          * {
            box-shadow: none !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Garantir que cores sejam impressas */
          .bg-gray-50 {
            background-color: #f9fafb !important;
          }

          /* Ajustar tamanhos de fonte */
          h2 {
            font-size: 14pt !important;
          }

          p, span {
            font-size: 10pt !important;
          }

          .text-xs {
            font-size: 8pt !important;
          }
        }

        /* Layout em paisagem (opcional) */
        @page {
          size: A4;
          margin: 10mm;
        }
      `}</style>
    </div>
  );
}