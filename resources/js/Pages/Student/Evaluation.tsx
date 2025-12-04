import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle2, Star, AlertCircle } from 'lucide-react';

declare global {
  var route: (name: string, params?: any, absolute?: boolean) => string;
}

const CRITERIA = [
  "CLAREZA DA PROPOSTA",
  "ORIGINALIDADE",
  "RELEVÂNCIA",
  "POTENCIAL DE IMPACTO",
  "EXECUÇÃO",
  "GRAU DE INOVAÇÃO",
  "APLICAÇÃO ADEQUADA DAS TECNOLOGIAS",
  "EFETIVIDADE",
  "QUALIDADE DA APRESENTAÇÃO",
  "APLICABILIDADE"
];

export default function StudentEvaluation({ project }: { project: any }) {
  const { data, setData, post, processing, errors } = useForm({
    email: '',
    scores: Array(10).fill(0),
  });

  const [currentCriterion, setCurrentCriterion] = useState(0);

  const handleScoreChange = (index: number, value: number) => {
    const newScores = [...data.scores];
    newScores[index] = value;
    setData('scores', newScores);
  };

  const goToNext = () => {
    if (currentCriterion < CRITERIA.length - 1) {
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
    post(route('student.store', project.id));
  };

  const completedCriteria = data.scores.filter(score => score > 0).length;
  const progress = (completedCriteria / CRITERIA.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <Head title={`Evaluate: ${project.title}`} />

      {/* Header fixo */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-1">
                {project.title}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                {project.leader} • {project.location}
              </p>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Progresso</span>
              <span className="font-semibold">{completedCriteria}/{CRITERIA.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Card de Email */}
        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-900">
              <Mail className="w-5 h-5 text-blue-600" />
              Identificação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Email Institucional
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={data.email}
                  onChange={e => setData('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none text-sm placeholder:text-gray-300 text-gray-900"
                  placeholder="seu.nome@aluno.unifapce.edu.br"
                  required
                />
              </div>
              {errors.email && (
                <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 p-2 rounded">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card de Avaliação - Modo Slide (Mobile) */}
        <div className="block sm:hidden">
          <Card className="shadow-xl border-0 bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-gray-600">
                  Critério {currentCriterion + 1} de {CRITERIA.length}
                </CardTitle>
                {data.scores[currentCriterion] > 0 && (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                )}
              </div>
              <CardDescription className="text-base sm:text-lg font-bold text-gray-900 mt-2">
                {CRITERIA[currentCriterion]}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Botões de nota em grid */}
              <div className="grid grid-cols-6 gap-2">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => handleScoreChange(currentCriterion, score)}
                    className={`
                      aspect-square rounded-lg font-bold text-sm transition-all
                      ${data.scores[currentCriterion] === score
                        ? 'bg-blue-600 text-white scale-110 shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
                      }
                    `}
                  >
                    {score}
                  </button>
                ))}
              </div>

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
                  disabled={currentCriterion === CRITERIA.length - 1}
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
          {CRITERIA.map((criterion, index) => (
            <Card key={index} className="shadow-xl border-0 bg-white">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-500">
                        #{index + 1}
                      </span>
                      {data.scores[index] > 0 && (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">
                      {criterion}
                    </h3>
                  </div>
                  {data.scores[index] > 0 && (
                    <div className="flex items-center gap-1 bg-blue-100 px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 text-blue-600 fill-blue-600" />
                      <span className="text-sm font-bold text-blue-900">
                        {data.scores[index]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Grid de notas */}
                <div className="grid grid-cols-11 gap-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => handleScoreChange(index, score)}
                      className={`
                        aspect-square rounded-lg font-bold text-xs sm:text-sm transition-all
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

                {errors[`scores.${index}`] && (
                  <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 p-2 rounded mt-2">
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
            disabled={processing || completedCriteria < CRITERIA.length}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-base font-bold shadow-lg"
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
                Enviar Avaliação ({completedCriteria}/{CRITERIA.length})
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}