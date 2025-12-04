import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { GraduationCap, CheckCircle } from 'lucide-react';

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

const API_URL = "http://localhost:8000/api"; // 🔥 Ajuste para a URL do seu backend

const EvaluateProject = () => {
  const { token } = useParams<{ token: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [scores, setScores] = useState<Record<string, number>>({});

  // Buscar projeto via token
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`${API_URL}/projects/by-token/${token}`);

        if (!response.ok) {
          toast.error('Projeto não encontrado');
          setLoading(false);
          return;
        }

        const data = await response.json();
        setProject(data);
      } catch (err) {
        toast.error('Erro ao conectar ao servidor');
        console.error(err);
      }

      setLoading(false);
    };

    if (token) fetchProject();
  }, [token]);

  const handleScoreChange = (criterio: string, value: number) => {
    setScores({ ...scores, [criterio]: value });
  };

  // Envio da avaliação
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.endsWith('@aluno.unipface.edu.br')) {
      toast.error('Use seu email institucional (@aluno.unipface.edu.br)');
      return;
    }

    const allScoresFilled = CRITERIOS.every(c => scores[c.key] !== undefined);
    if (!allScoresFilled) {
      toast.error('Preencha todos os critérios de avaliação');
      return;
    }

    setSubmitting(true);

    const evaluationData = {
      project_id: project!.id,
      evaluator_email: email,
      evaluator_name: name,
      evaluator_type: 'aluno',
      ...scores
    };

    try {
      const response = await fetch(`${API_URL}/evaluations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(evaluationData)
      });

      if (response.status === 409) {
        toast.error('Você já avaliou este projeto');
        setSubmitting(false);
        return;
      }

      if (!response.ok) {
        toast.error('Erro ao enviar avaliação');
        setSubmitting(false);
        return;
      }

      toast.success('Avaliação enviada com sucesso!');
      setSubmitted(true);

    } catch (err) {
      toast.error('Erro ao conectar ao servidor');
      console.error(err);
    }

    setSubmitting(false);
  };

  // Telas de carregamento, erro e sucesso
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando projeto...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Projeto não encontrado</CardTitle>
            <CardDescription>O link pode estar inválido.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
        <Card className="w-full max-w-md text-center shadow-elevated">
          <CardHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-accent-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl">Avaliação Enviada!</CardTitle>
              <CardDescription className="mt-2">
                Obrigado por avaliar o projeto "{project.title}"
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Tela principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="shadow-elevated">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
            </div>

            <div>
              <CardTitle className="text-2xl">Avaliação de Projeto</CardTitle>
              <CardDescription className="mt-2">
                <strong>{project.title}</strong> <br />
                Líder: {project.lider} | Local: {project.local}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados do avaliador */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Institucional</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.nome@aluno.unipface.edu.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Use seu email institucional @aluno.unipface.edu.br
                  </p>
                </div>
              </div>

              {/* Critérios */}
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Critérios de Avaliação</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Avalie cada critério de 0 a 10
                </p>

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
                        onChange={(e) => handleScoreChange(criterio.key, parseInt(e.target.value) || 0)}
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? 'Enviando...' : 'Enviar Avaliação'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EvaluateProject;
