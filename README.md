# Sistema de Gerenciamento e Avaliação de TCCs

Sistema web desenvolvido para gerenciar e avaliar Trabalhos de Conclusão de Curso (TCCs). A aplicação permite que administradores gerenciem TCCs, professores e avaliações, enquanto professores realizam avaliações de bancas e de seus orientandos.

## 🚀 Funcionalidades

### 👑 Administrador
- **Dashboard**: Visão geral com estatísticas de TCCs e avaliações.
- **Importação de TCCs**: Importação em massa via arquivo CSV (formato específico com Orientador e Banca).
- **Gestão de Professores**: Criação automática de contas para professores e geração de senhas temporárias.
- **Relatórios**: Visualização detalhada dos TCCs avaliados com médias por etapa (Etapa 1 e Etapa 2) e média final.
- **Exportação**: Exportação dos resultados finais em CSV.

### 👨‍🏫 Professor
- **Login Simplificado**: Acesso via nome e senha temporária.
- **Dashboard**:
    - Lista de TCCs atribuídos (Banca Avaliadora e Orientandos).
    - Status de avaliação por etapa (Etapa 1 e Etapa 2).
    - Identificação visual de papel (Avaliador ou Orientador).
- **Avaliação**:
    - Formulário para avaliar TCCs nas duas etapas.
    - Acesso permitido para membros da banca e orientadores.

## 🛠️ Tecnologias Utilizadas

- **Backend**: Laravel 12, PHP 8.3
- **Frontend**: React 19, Inertia.js 2.0, TypeScript
- **Estilização**: Tailwind CSS 4, Shadcn UI
- **Banco de Dados**: PostgreSQL
- **Infraestrutura**: Docker, Nginx, Supervisor

## 🐳 Pré-requisitos

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## ⚡ Como Rodar o Projeto

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/tcc-system.git
   cd tcc-system
   ```

2. **Configure as Variáveis de Ambiente**
   Copie o arquivo de exemplo:
   ```bash
   cp .env.example .env
   ```
   
   Certifique-se de que o `.env` contenha as configurações do Docker (DB_HOST=db, etc.).

3. **Inicie o Ambiente**
   Utilize o Docker Compose para construir e iniciar os containers:
   ```bash
   docker compose build
   docker compose up -d
   ```

4. **Prepare o Banco de Dados**
   Rode as migrações e seeds:
   ```bash
   docker compose exec app php artisan migrate --seed
   ```

5. **Acesse a Aplicação**
   - URL: [http://localhost:8000](http://localhost:8000)

## 📦 Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `docker compose up -d` | Inicia os containers em background |
| `docker compose down` | Para e remove os containers |
| `docker compose build` | Reconstrói as imagens (necessário após alterações no frontend/backend) |
| `docker compose exec app bash` | Acessa o terminal do container da aplicação |

## 🧪 Usuários de Teste (Seed)

O comando `php artisan db:seed` cria usuários iniciais:

- **Admin**: `admin@example.com` / `password`
- **Professores**: Verifique no Dashboard do Admin (menu "Professores").

## 📝 Licença

Este projeto está sob a licença MIT.
