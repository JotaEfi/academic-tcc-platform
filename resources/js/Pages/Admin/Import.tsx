import React, { useState, useRef } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileType, CheckCircle, AlertCircle, Loader2, Download } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

declare global {
    var route: (name: string, params?: any, absolute?: boolean) => string;
}

export default function Import() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const { props } = usePage();
    const flash = props.flash as { success?: string, error?: string } || {};

    const { data, setData, post, processing, errors, reset } = useForm({
        csv_file: null as File | null,
        period: `${new Date().getFullYear()}.1`, // e.g. "2026.1"
    });

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                setData('csv_file', file);
            } else {
                alert('Por favor, selecione apenas arquivos CSV.');
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setData('csv_file', e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.csv_file) return;

        post(route('admin.import'), {
            preserveScroll: true,
            onSuccess: () => {
                reset('csv_file', 'period');
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Importar Dados', href: route('admin.import_show') }]}>
            <Head title="Importar TCCs" />

            <div className="flex flex-col gap-6 p-4 md:p-8 pt-0">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Importar via CSV</h1>
                        <p className="text-sm text-gray-500 mt-1">Carregue sua planilha com os dados dos TCCs, alunos e orientadores para cadastrá-los em lote.</p>
                    </div>
                </div>

                {flash.success && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-4 flex items-center gap-3 shadow-sm">
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                        <p className="text-sm font-medium">{flash.success}</p>
                    </div>
                )}
                {flash.error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-center gap-3 shadow-sm">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                        <p className="text-sm font-medium">{flash.error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="shadow-xl border-0 bg-white">
                            <CardHeader>
                                <CardTitle>Upload do Arquivo</CardTitle>
                                <CardDescription>Arraste e solte o seu arquivo .csv aqui ou clique para procurar no seu computador.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="flex gap-4 mb-6">
                                        <div className="w-1/2 sm:w-1/4">
                                            <label htmlFor="periodYear" className="block text-sm font-medium text-gray-700 mb-1">
                                                Ano Letivo <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                id="periodYear"
                                                value={data.period.split('.')[0] || new Date().getFullYear().toString()}
                                                onChange={e => setData('period', `${e.target.value}.${data.period.split('.')[1] || '1'}`)}
                                                className="w-full flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#216f7d] focus:border-transparent transition-shadow"
                                            >
                                                {Array.from({length: 10}, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                                                    <option key={y} value={y}>{y}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-1/2 sm:w-1/4">
                                            <label htmlFor="periodSemester" className="block text-sm font-medium text-gray-700 mb-1">
                                                Período <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                id="periodSemester"
                                                value={data.period.split('.')[1] || '1'}
                                                onChange={e => setData('period', `${data.period.split('.')[0] || new Date().getFullYear().toString()}.${e.target.value}`)}
                                                className="w-full flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#216f7d] focus:border-transparent transition-shadow"
                                            >
                                                <option value="1">1</option>
                                                <option value="2">2</option>
                                            </select>
                                        </div>
                                    </div>
                                    {errors.period && <p className="text-sm text-red-500 mb-6 -mt-4">{errors.period}</p>}

                                    <div
                                        className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-colors cursor-pointer min-h-[300px]
                                            ${isDragging ? 'border-[#216f7d] bg-[#216f7d]/5' : 'border-gray-300 hover:border-[#17a8bb] hover:bg-gray-50'}
                                            ${data.csv_file ? 'border-emerald-400 bg-emerald-50/50' : ''}
                                        `}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept=".csv, text/csv"
                                            onChange={handleFileChange}
                                        />
                                        
                                        {!data.csv_file ? (
                                            <>
                                                <div className="w-20 h-20 rounded-full bg-blue-50/80 flex items-center justify-center mb-6 shadow-sm">
                                                    <UploadCloud className="w-10 h-10 text-[#216f7d]" />
                                                </div>
                                                <p className="text-lg font-semibold text-gray-700">Clique para selecionar ou arraste aqui</p>
                                                <p className="text-sm text-gray-500 mt-2">Apenas arquivos no formato .csv são suportados</p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-20 h-20 rounded-full bg-emerald-100/80 flex items-center justify-center mb-6 shadow-sm">
                                                    <FileType className="w-10 h-10 text-emerald-600" />
                                                </div>
                                                <p className="text-lg font-semibold text-emerald-800 text-center max-w-md truncate">
                                                    {data.csv_file.name}
                                                </p>
                                                <p className="text-sm text-emerald-600/80 mt-1 font-medium">
                                                    {(data.csv_file.size / 1024).toFixed(1)} KB selecionado
                                                </p>
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="mt-6 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setData('csv_file', null);
                                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                                    }}
                                                >
                                                    Trocar arquivo
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                    
                                    {errors.csv_file && (
                                        <p className="text-sm text-red-500 flex items-center gap-1.5 mt-2 font-medium">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.csv_file}
                                        </p>
                                    )}

                                    <div className="flex justify-end pt-4">
                                        <Button 
                                            type="submit" 
                                            disabled={!data.csv_file || processing}
                                            className="bg-[#216f7d] hover:bg-[#1a5b67] text-white px-8 py-6 text-base shadow-md disabled:opacity-50 transition-all"
                                        >
                                            {processing ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                                    Enviando e Processando...
                                                </>
                                            ) : (
                                                'Importar Arquivo CSV'
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="shadow-xl border-0 bg-white">
                            <CardHeader className="pb-4 border-b border-gray-100">
                                <CardTitle className="text-lg text-[#216f7d]">Formato Esperado</CardTitle>
                                <CardDescription>Seu CSV deve conter as seguintes colunas na primeira linha (cabeçalho).</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-5">
                                <ul className="space-y-4 text-sm text-gray-600">
                                    <li className="flex items-start gap-3">
                                        <span className="font-mono bg-[#216f7d]/10 text-[#216f7d] px-2 py-0.5 rounded-md text-xs mt-0.5 font-bold">1</span>
                                        <span><strong className="text-gray-900 block mb-0.5">ID</strong> Código identificador único do projeto (ex: TCC01).</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="font-mono bg-[#216f7d]/10 text-[#216f7d] px-2 py-0.5 rounded-md text-xs mt-0.5 font-bold">2</span>
                                        <span><strong className="text-gray-900 block mb-0.5">PROJETO</strong> O título completo do Trabalho de Conclusão de Curso.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="font-mono bg-[#216f7d]/10 text-[#216f7d] px-2 py-0.5 rounded-md text-xs mt-0.5 font-bold">3</span>
                                        <span><strong className="text-gray-900 block mb-0.5">ALUNO</strong> Nome completo do estudante.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="font-mono bg-[#216f7d]/10 text-[#216f7d] px-2 py-0.5 rounded-md text-xs mt-0.5 font-bold">4</span>
                                        <span><strong className="text-gray-900 block mb-0.5">ORIENTADOR</strong> Nome do orientador. O sistema criará a conta automaticamente se não existir.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="font-mono bg-[#216f7d]/10 text-[#216f7d] px-2 py-0.5 rounded-md text-xs mt-0.5 font-bold">5</span>
                                        <span><strong className="text-gray-900 block mb-0.5">AVALIADORES</strong> Nomes separados por vírgula. Contas também serão criadas automaticamente.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="font-mono bg-[#216f7d]/10 text-[#216f7d] px-2 py-0.5 rounded-md text-xs mt-0.5 font-bold">6</span>
                                        <span><strong className="text-gray-900 block mb-0.5">LOCAL</strong> Onde ocorrerá a defesa (ex: Sala 1E).</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="font-mono bg-[#216f7d]/10 text-[#216f7d] px-2 py-0.5 rounded-md text-xs mt-0.5 font-bold">7</span>
                                        <span><strong className="text-gray-900 block mb-0.5">DATA/HORA</strong> Exemplo: 09/12, 17:00 às 17:50. O sistema extrairá a data.</span>
                                    </li>
                                </ul>
                                
                                <div className="mt-8 pt-5 border-t border-gray-100 bg-amber-50/50 -mx-6 px-6 -mb-6 pb-6 rounded-b-xl">
                                    <p className="text-sm font-bold text-amber-700 mb-2 flex items-center gap-1.5">
                                        <AlertCircle className="w-4 h-4" /> Importante sobre Contas
                                    </p>
                                    <p className="text-xs text-amber-600/90 leading-relaxed">
                                        Ao fazer upload de TCCs com nomes de professores inéditos, o sistema automaticamente cria <strong>contas de acesso (role: professor)</strong> para eles. O e-mail provisório é gerado em letras minúsculas (nome.sobrenome@example.com) com uma senha provisória aleatória.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
