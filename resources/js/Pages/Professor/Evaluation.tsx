import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Star, AlertCircle, GraduationCap, Calendar, MapPin, User } from 'lucide-react';

declare global {
  var route: (name: string, params?: any, absolute?: boolean) => string;
}

const CRITERIA_ETAPA1 = [
  { name: "Título", description: "A pertinência com o conteúdo do artigo." },
  { name: "Palavras-chave", description: "A pertinência com o conteúdo do artigo." },
  { name: "Escrita", description: "O uso adequado das regras ortográficas e gramaticais. Atendimento da forma (do padrão exigido)." },
  { name: "Linguagem", description: "Clareza e fluência do texto." },
  { name: "Introdução", description: "A contextualização da temática e a justificativa do trabalho." },
  { name: "Objetivos", description: "A definição do que se pretende/pretendeu realizar. A pertinência do tema do trabalho ao curso." },
  { name: "Fundamentação Teórica", description: "A pertinência ao tema, relevância dos textos, abrangência/qualidade da revisão, coerência e normas ABNT." },
  { name: "Metodologia / Desenvolvimento", description: "Descrição de como o trabalho foi realizado, adequação aos objetivos, procedimentos adotados." },
  { name: "Resultados obtidos", description: "Verificar se objetivos foram alcançados e resultados descritos com detalhamento apropriado." }
];

const CRITERIA_ETAPA2 = [
  { name: "Organização da apresentação", description: "Estrutura lógica e sequência da apresentação." },
  { name: "Clareza de expressão", description: "Comunicação verbal clara e objetiva." },
  { name: "Domínio do conteúdo", description: "Demonstração de conhecimento sobre o tema abordado." },
  { name: "Correção da informação", description: "Precisão e exatidão dos dados apresentados." },
  { name: "Capacidade argumentativa", description: "Habilidade de responder perguntas e sustentar argumentos." }
];

export default function ProfessorEvaluation({ tcc, stage, existingEvaluation }: { tcc: any, stage: string, existingEvaluation: any }) {
  const criteriaList = stage === 'etapa1' ? CRITERIA_ETAPA1 : CRITERIA_ETAPA2;

  // Initialize scores from existing evaluation if available
  const initialScores = existingEvaluation ? existingEvaluation.scores : Array(criteriaList.length).fill(null);

  const { data, setData, post, processing, errors } = useForm({
    stage: stage,
    scores: initialScores,
  });

  const [currentCriterion, setCurrentCriterion] = useState(0);

  const handleScoreChange = (index: number, value: number) => {
    const newScores = [...data.scores];
    newScores[index] = value;
    setData('scores', newScores);
  };

  const goToNext = () => {
    if (currentCriterion < criteriaList.length - 1) {
      setCurrentCriterion(currentCriterion + 1);
    }
  };

  const goToPrevious = () => {
    if (currentCriterion > 0) {
      setCurrentCriterion(currentCriterion - 1);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('professor.store', tcc.id), {
      onSuccess: () => {
        window.location.href = route('professor.dashboard');
      }
    });
  };

  const completedCriteria = data.scores.filter(score => score !== null).length;
  const progress = (completedCriteria / criteriaList.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <Head title={`Avaliar: ${tcc.title}`} />

      {/* Header fixo */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Button
              onClick={() => window.location.href = route('professor.dashboard')}
              className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-semibold text-blue-600 uppercase">
                  {stage === 'etapa1' ? 'Etapa 1 (Artigo)' : 'Etapa 2 (Banca)'}
                  {existingEvaluation && ' (Editar)'}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-1">
                {tcc.title}
              </h1>
              <div className="flex flex-wrap gap-3 text-xs text-gray-600 mt-1">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{tcc.student}</span>
                </div>
                {tcc.orientador && (
                  <div className="flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    <span>{tcc.orientador.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stage selector */}
          <div className="flex gap-2 mb-3">
            <Button
              onClick={() => window.location.href = route('professor.evaluate', { id: tcc.id, stage: 'etapa1' })}
              className={`flex-1 ${stage === 'etapa1' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Etapa 1
            </Button>
            <Button
              onClick={() => window.location.href = route('professor.evaluate', { id: tcc.id, stage: 'etapa2' })}
              className={`flex-1 ${stage === 'etapa2' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Etapa 2
            </Button>
          </div>

          {/* Barra de progresso */}
          <div>
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Progresso da Avaliação</span>
              <span className="font-semibold">{completedCriteria}/{criteriaList.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">

        {/* Legenda de Notas */}
        <Card className="shadow-sm border-0 bg-white mb-4">
          <CardContent className="py-3 px-4 flex justify-center">
            <div className="w-full max-w-xl">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Legenda de Notas</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-x-4 gap-y-1 text-xs text-gray-700">
                <div className="flex items-center gap-1 whitespace-nowrap"><span className="font-bold text-green-700">5</span> - Excelente</div>
                <div className="flex items-center gap-1 whitespace-nowrap"><span className="font-bold text-blue-700">4</span> - Bom</div>
                <div className="flex items-center gap-1 whitespace-nowrap"><span className="font-bold text-yellow-700">3</span> - Regular</div>
                <div className="flex items-center gap-1 whitespace-nowrap"><span className="font-bold text-orange-700">2</span> - Ruim</div>
                <div className="flex items-center gap-1 whitespace-nowrap col-span-2 sm:col-span-1"><span className="font-bold text-red-700">0</span> - Insuficiente</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card de Avaliação - Modo Slide (Mobile) */}
        <div className="block sm:hidden">
          <Card className="shadow-xl border-0 bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-gray-600">
                  Critério {currentCriterion + 1} de {criteriaList.length}
                </CardTitle>
                {data.scores[currentCriterion] !== null && (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                )}
              </div>
              <CardDescription className="text-base sm:text-lg font-bold text-gray-900 mt-2">
                {criteriaList[currentCriterion].name}
              </CardDescription>
              <p className="text-sm text-gray-500 mt-1">
                {criteriaList[currentCriterion].description}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Botões de nota em grid */}
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => handleScoreChange(currentCriterion, score)}
                    className={`
                      py-3 rounded-lg font-bold text-sm transition-all
                      ${data.scores[currentCriterion] === score
                        ? 'bg-blue-600 text-white scale-105 shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
                      }
                    `}
                  >
                    {score}
                  </button>
                ))}
              </div>

              {errors[`scores.${currentCriterion}`] && (
                <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 p-2 rounded">
                  <AlertCircle className="w-4 h-4" />
                  {errors[`scores.${currentCriterion}`]}
                </div>
              )}

              {/* Navegação */}
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  onClick={goToPrevious}
                  disabled={currentCriterion === 0}
                  className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Anterior
                </Button>
                <Button
                  type="button"
                  onClick={goToNext}
                  disabled={currentCriterion === criteriaList.length - 1}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Próximo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista completa (Desktop/Tablet) */}
        <div className="hidden sm:block space-y-3">
          {criteriaList.map((criterion, index) => (
            <Card key={index} className="shadow-xl border-0 bg-white">
              <CardContent className="p-4 flex justify-center">
                <div className="flex items-start justify-between gap-6 w-full max-w-4xl">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-500">
                        #{index + 1}
                      </span>
                      {data.scores[index] !== null && (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">
                      {criterion.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {criterion.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    {data.scores[index] !== null && (
                      <div className="flex items-center gap-1 bg-blue-100 px-3 py-1 rounded-full">
                        <Star className="w-4 h-4 text-blue-600 fill-blue-600" />
                        <span className="text-sm font-bold text-blue-900">
                          {data.scores[index]}
                        </span>
                      </div>
                    )}

                    {/* Grid de notas */}
                    <div className="grid grid-cols-6 gap-2">
                      {[0, 1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => handleScoreChange(index, score)}
                          className={`
                            px-3 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all
                            ${data.scores[index] === score
                              ? 'bg-blue-600 text-white scale-105 shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
                            }
                          `}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {errors[`scores.${index}`] && (
                  <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 p-2 rounded mt-2 w-full max-w-4xl mx-auto">
                    <AlertCircle className="w-4 h-4" />
                    {errors[`scores.${index}`]}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Erro geral de scores */}
        {errors.scores && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            {errors.scores}
          </div>
        )}

        {/* Botão de enviar */}
        <div className="sticky bottom-0 pt-4 pb-2 bg-gray-50">
          <Button
            onClick={submit}
            disabled={processing || completedCriteria < criteriaList.length}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-bold shadow-lg"
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                {existingEvaluation ? 'Atualizar Avaliação' : 'Enviar Avaliação'} ({completedCriteria}/{criteriaList.length})
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}