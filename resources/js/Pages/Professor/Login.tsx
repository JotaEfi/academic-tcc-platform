import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, User, Lock, Eye, EyeOff } from 'lucide-react';

declare global {
  var route: (name: string, params?: any, absolute?: boolean) => string;
}

export default function ProfessorLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    password: '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('professor.login.store'));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Head title="Professor Login" />

      <div className="w-full max-w-md">
        {/* Logo ou Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Avaliação</h1>
          <p className="text-gray-600 mt-2">Acesso para Professores</p>
        </div>

        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-gray-900">Professor Login</CardTitle>
            <CardDescription>
              Digite seu nome e senha temporária
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={submit}>
              <div className="space-y-4">
                {/* Campo Nome */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="name">
                    Nome
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="name"
                      type="text"
                      placeholder="Seu nome completo"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all outline-none placeholder:text-gray-300 text-gray-900"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                </div>

                {/* Campo Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="password">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all outline-none placeholder:text-gray-300 text-gray-900"
                      value={data.password}
                      onChange={(e) => setData('password', e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && <div className="text-red-500 text-xs mt-1">{errors.password}</div>}
                </div>

                {/* Botão Submit */}
                <Button
                  type="submit"
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 transition-colors"
                  disabled={processing}
                >
                  {processing ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Entrando...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Entrar
                    </span>
                  )}
                </Button>
              </div>
            </form>

            {/* Informação adicional */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 text-center">
                <strong>Nota:</strong> Use a senha temporária fornecida pela coordenação
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>© 2024 Sistema de Avaliação de Projetos</p>
        </div>
      </div>
    </div>
  );
}