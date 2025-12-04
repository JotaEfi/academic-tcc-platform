import React from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Sparkles, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

declare global {
  var route: (name: string, params?: any, absolute?: boolean) => string;
}

export default function StudentSuccess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Head title="Avaliação Enviada" />

      <div className="max-w-md w-full">
        {/* Animação de confete (visual) */}
        <div className="relative">
          {/* Card principal */}
          <Card className="shadow-2xl border-0 bg-white overflow-hidden">
            <CardContent className="p-8 sm:p-10 text-center">
              {/* Ícone de sucesso animado */}
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
                <div className="relative bg-gradient-to-br from-green-400 to-green-600 rounded-full p-6 shadow-lg">
                  <CheckCircle2 className="w-16 h-16 text-white" strokeWidth={3} />
                </div>
              </div>

              {/* Título */}
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                Avaliação Enviada!
              </h1>

              {/* Subtítulo */}
              <p className="text-gray-600 text-base sm:text-lg mb-6">
                Obrigado por participar! Sua avaliação foi registrada com sucesso.
              </p>

              {/* Detalhes */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                  <Sparkles className="w-4 h-4 text-green-600" />
                  <span className="font-medium">
                    Sua contribuição é muito importante para nós!
                  </span>
                </div>
              </div>

              {/* Mensagem adicional */}
              <div className="space-y-2 mb-8">
                <p className="text-sm text-gray-500">
                  Você pode fechar esta janela ou avaliar outro projeto.
                </p>
              </div>

              {/* Botões de ação */}
              <div className="space-y-3">
                <Button
                  onClick={() => window.close()}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-6 text-base font-semibold shadow-lg"
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Fechar
                </Button>

                <button
                  onClick={() => window.history.back()}
                  className="w-full py-3 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                >
                  Avaliar outro projeto
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Elementos decorativos */}
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-green-200 rounded-full opacity-20 blur-2xl"></div>
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-200 rounded-full opacity-20 blur-2xl"></div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Sistema de Avaliação de Projetos
          </p>
        </div>
      </div>

      {/* Estilos para animações */}
      <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .animate-ping {
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}