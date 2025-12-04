import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User, ClipboardList } from 'lucide-react';

interface Professor {
  id: string;
  full_name: string;
  email: string;
}

interface Project {
  id: string;
  title: string;
  lider: string;
  local: string;
}

const CRITERIOS = [
  { key: 'clareza_proposta', label: 'Clareza da Proposta' },
  { key: 'originalidade', label: 'Originalidade' },
  { key: 'relevancia', label: 'Relevância' },
  { key: 'potencial_impacto', label: 'Potencial de Impacto' },
  { key: 'execucao', label: 'Execução' },
  { key: 'grau_inovacao', label: 'Grau de Inovação' },
  { key: 'aplicacao_tecnologias', label: 'Aplicação Adequada das Tecnologias' },
  { key: 'efetividade', label: 'Efetividade' },
  { key: 'qualidade_apresentacao', label: 'Qualidade da Apresentação' },
  { key: 'aplicabilidade', label: 'Aplicabilidade' },
];

const ProfessorAccess = () => {
  const { token } = useParams<{ token: string }>();

  const [professor, setProfessor] = useState<Professor | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  // ------------------------------------------------------
  // 🔄 FUNÇÕES PARA VOCÊ CONECTAR SUA API AQUI
  // ------------------------------------------------------

  const fetchProfessorData = async (token: string) => {
    try {
      // 👉 Aqui você faz sua requisição (Axios, fetch, etc)
      // const response = await fetch(`/api/professors/${token}`);
      // return response.json();

      return null; // <- remover quando integrar
    } catch (err) {
      return null;
    }
  };

  const fetchProjects = async (professorId: string) => {
    try {
      // const response = await fetch(`/api/projects/${professorId}`);
      // return await response.json();

      return []; // <- remover quando ligar sua API
    } catch (err) {
      return [];
    }
  };

  const submitEvaluation = async (data: any) => {
    try {
      // await fetch('/api/evaluations', { method: 'POST', body: JSON.stringify(data) });

      return { error: null }; // <- ajustar depois
    } catch (err) {
      return { error: { code: 'DEFAULT', message: err } };
    }
  };

  // ------------------------------------------------------
  // 🔄 EFFECT CARREGANDO DADOS
  // ------------------------------------------------------

  useEffect(() => {
    const loadData = async () => {
      if (!token) return;

      const prof = await fetchProfessorData(token);

      if (!prof) {
        toast.error('Link de acesso inválido');
        setLoading(false);
        return;
      }

      setProfessor(prof);

    //   const proj = await fetchProjects(prof.id);
    //   setProjects(proj);

      setLoading(false);
    };

    loadData();
  }, [token]);

  // ------------------------------------------------------
  // 🔧 MUDAR NOTA
  // ------------------------------------------------------

  const handleScoreChange = (criterio: string, value: number) => {
    setScores(prev => ({ ...prev, [criterio]: value }));
  };

  // ------------------------------------------------------
  // 📤 ENVIAR AVALIAÇÃO
  // ------------------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProject || !professor) return;

    const allFilled = CRITERIOS.every(c => scores[c.key] !== undefined);

    if (!allFilled) {
      toast.error('Preencha todos os critérios');
      return;
    }

    setSubmitting(true);

    const evaluationData = {
      project_id: selectedProject,
      evaluator_email: professor.email,
      evaluator_name: professor.full_name,
      evaluator_type: 'professor',
      ...scores,
    };

    const { error } = await submitEvaluation(evaluationData);

    setSubmitting(false);

    if (error) {
      toast.error('Erro ao enviar');
      return;
    }

    toast.success('Avaliação enviada!');
    setSelectedProject(null);
    setScores({});
  };

  // ------------------------------------------------------
  // 🌀 TELAS
  // ------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!professor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Link inválido</CardTitle>
            <CardDescription>
              O link de acesso que você está usando não é válido.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // ------------------------------------------------------
  // 📌 TELA PRINCIPAL
  // ------------------------------------------------------

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Professor: {professor.full_name}</h1>
            <p className="text-sm text-muted-foreground">{professor.email}</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {projects.length === 0 ? (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Nenhum Projeto Atribuído</CardTitle>
              <CardDescription>Você ainda não tem projetos para avaliar.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Projetos Atribuídos</CardTitle>
                <CardDescription>Selecione um projeto</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {projects.map((project) => (
                    <Button
                      key={project.id}
                      variant={selectedProject === project.id ? 'default' : 'outline'}
                      className="w-full justify-start h-auto py-4"
                      onClick={() => setSelectedProject(project.id)}
                    >
                      <ClipboardList className="w-4 h-4 mr-3" />
                      <div className="text-left">
                        <div className="font-semibold">{project.title}</div>
                        <div className="text-xs opacity-80">
                          Líder: {project.lider} | Local: {project.local}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {selectedProject && (
              <Card className="shadow-elevated">
                <CardHeader>
                  <CardTitle>Avaliação</CardTitle>
                  <CardDescription>Avalie cada critério de 0 a 10</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      {CRITERIOS.map((criterio) => (
                        <div key={criterio.key} className="space-y-2">
                          <Label htmlFor={criterio.key}>{criterio.label}</Label>
                          <Input
                            id={criterio.key}
                            type="number"
                            min="0"
                            max="10"
                            value={scores[criterio.key] ?? ''}
                            onChange={(e) =>
                              handleScoreChange(criterio.key, parseInt(e.target.value) || 0)
                            }
                            required
                          />
                        </div>
                      ))}
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                      {submitting ? 'Enviando...' : 'Enviar Avaliação'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfessorAccess;
