import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import unifapLogo from '@/assets/logo-unifap.png';
import salaOcio from '@/assets/sala-ocio.png';

export default function Login({ status, canResetPassword }: { status?: string, canResetPassword?: boolean }) {
  const [showPassword, setShowPassword] = useState(false);
  const { data, setData, post, processing, errors, reset } = useForm({
    email: '',
    password: '',
    remember: false,
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('login'), {
      onFinish: () => reset('password'),
    });
  };

  return (
    <div className="min-h-screen flex w-full">
      <Head title="Admin Login" />

      {/* Esquerda: Form (40%) */}
      <div className="w-full lg:w-[40%] flex flex-col justify-center items-center p-8 bg-gray-50 dark:bg-zinc-950">
        <div className="w-full max-w-sm">
          {/* Logo Desktop - Acima do card ao centro */}
          <div className="hidden lg:flex justify-center mb-6">
            <img src={unifapLogo} alt="UNIFAP Logo" className="w-12 h-12 object-contain drop-shadow-sm" />
          </div>

          {/* Logo Mobile Only */}
          <div className="lg:hidden text-center mb-8">
            <img src={unifapLogo} alt="UNIFAP Logo" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sistema de Avaliação</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Acesso para Administradores</p>
          </div>

          <Card className="shadow-none border-0 bg-transparent lg:bg-white lg:shadow-xl lg:border lg:border-gray-100 lg:dark:bg-zinc-900 lg:dark:border-zinc-800">
            <CardHeader className="space-y-1 pb-6 lg:pb-4 text-center lg:text-left">
              <CardTitle className="text-2xl text-gray-900 dark:text-white font-bold tracking-tight">Olá Administrador</CardTitle>
              <CardDescription className="text-gray-500 dark:text-zinc-400">
                Digite seu email e senha para acessar o painel
              </CardDescription>
            </CardHeader>

            <CardContent>
              {status && <div className="mb-4 font-medium text-sm text-emerald-600 dark:text-emerald-400">{status}</div>}

              <form onSubmit={submit}>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="email">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        id="email"
                        type="email"
                        placeholder="admin@unifap.br"
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-[#216f7d] focus:border-[#216f7d] transition-all outline-none placeholder:text-gray-400 text-gray-900 dark:text-white text-sm"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                    {errors.email && <div className="text-red-500 text-xs mt-1 font-medium">{errors.email}</div>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="password">
                      Senha
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-12 py-2.5 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-[#216f7d] focus:border-[#216f7d] transition-all outline-none placeholder:text-gray-400 text-gray-900 dark:text-white text-sm tracking-wide"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && <div className="text-red-500 text-xs mt-1 font-medium">{errors.password}</div>}
                  </div>

                  {/* Botão Submit */}
                  <Button
                    type="submit"
                    className="w-full bg-[#216f7d] hover:bg-[#1a5b67] text-white py-5 rounded-xl transition-all shadow-md hover:shadow-lg font-semibold tracking-wide"
                    disabled={processing}
                  >
                    {processing ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white/80" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Autenticando...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <LogIn className="w-5 h-5 mr-2" />
                        Acessar Painel
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Footer Mobile */}
          <div className="mt-12 text-center text-xs text-gray-500 font-medium lg:hidden">
            <p>© {new Date().getFullYear()} Sistema de Avaliação de TCC</p>
          </div>
        </div>
      </div>

      {/* Direita: Imagem de Fundo (60%) */}
      <div 
        className="hidden lg:flex w-[60%] relative overflow-hidden items-center justify-center p-12 bg-cover bg-center"
        style={{ backgroundImage: `url(${salaOcio})` }}
      >
        {/* Overlay escuro/colorido para garantir leitura */}
        <div className="absolute inset-0 bg-[#216f7d]/80 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent"></div>

        <div className="relative z-10 w-full max-w-3xl flex flex-col items-center text-center mt-20">
            <h3 className="text-2xl md:text-3xl font-semibold mb-2 text-white/90 drop-shadow-md">Avalia TCC</h3>
            <h2 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight drop-shadow-2xl">
                Portal de Avaliações
            </h2>
            
            <p className="mt-8 text-white/90 text-lg md:text-xl max-w-2xl font-medium drop-shadow-lg leading-relaxed">
                Painel Administrativo da Coordenação.
                Gerencie TCCs, controle períodos de avaliação, gere relatórios e extraia resultados com facilidade.
            </p>

            <div className="absolute -bottom-32 left-0 right-0 text-center">
                <p className="text-white/60 text-sm font-medium">
                    Centro Universitário  © {new Date().getFullYear()}
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}