# Configuração de Deploy via FTP

Este documento descreve como configurar os GitHub Actions para deploy automático da aplicação Laravel+React via FTP.

## GitHub Secrets Necessários

Configure os seguintes secrets no seu repositório GitHub em: **Settings → Secrets and variables → Actions → New repository secret**

| Secret             | Descrição                                            | Exemplo                                          |
| ------------------ | ------------------------------------------------------ | ------------------------------------------------ |
| `FTP_HOST`       | Endereço do servidor FTP                              | `ftp.seuservidor.com`                          |
| `FTP_USERNAME`   | Usuário FTP                                           | `usuario@seudominio.com`                       |
| `FTP_PASSWORD`   | Senha FTP                                              | `senha_segura`                                 |
| `FTP_PORT`       | Porta FTP (opcional, padrão: 21)                      | `21`                                           |
| `FTP_PROTOCOL`   | Protocolo FTP (opcional, padrão: ftps)                | `ftps` ou `ftp`                              |
| `FTP_SERVER_DIR` | Diretório no servidor (**DEVE terminar com /**) | `/www/` ou `/public_html/`                   |
| `APP_NAME`       | Nome da aplicação                                    | `Amostra PI`                                   |
| `APP_ENV`        | Ambiente (opcional, padrão: production)               | `production`                                   |
| `APP_KEY`        | Chave de criptografia Laravel                          | `base64:...` (gerado automaticamente se vazio) |
| `APP_DEBUG`      | Debug mode (opcional, padrão: false)                  | `false`                                        |
| `APP_URL`        | URL da aplicação                                     | `https://seusite.com`                          |
| `DB_CONNECTION`  | Tipo de banco (opcional, padrão: pgsql)               | `pgsql` ou `mysql`                           |
| `DB_HOST`        | Host do banco de dados                                 | `localhost` ou `db.servidor.com`             |
| `DB_PORT`        | Porta do banco (opcional, padrão: 5432)               | `5432`                                         |
| `DB_DATABASE`    | Nome do banco de dados                                 | `amostra_pi`                                   |
| `DB_USERNAME`    | Usuário do banco                                      | `postgres`                                     |
| `DB_PASSWORD`    | Senha do banco                                         | `secret`                                       |

> ⚠️ **IMPORTANTE**: O `FTP_SERVER_DIR` deve **sempre terminar com barra (/)** e ser o caminho completo onde os arquivos devem ser enviados. Exemplos:
>
> - Se o root do site é `/public_html/`, use: `/public_html/`
> - Se o root do site é `/httpdocs/`, use: `/httpdocs/`
> - Se é o diretório raiz do FTP, use apenas: `/`

## 🔐 Configuração do FTP

### Protocolos Suportados

- **FTPS** (FTP Secure - recomendado): FTP sobre TLS/SSL
- **FTP**: FTP padrão (não recomendado para produção)

> ⚠️ **IMPORTANTE**: Use sempre FTPS em produção para garantir que suas credenciais e arquivos sejam transferidos de forma segura.

### Como Obter as Credenciais FTP

As credenciais FTP geralmente são fornecidas pelo seu provedor de hospedagem:

1. Acesse o painel de controle da sua hospedagem (cPanel, Plesk, etc.)
2. Procure por "Contas FTP" ou "FTP Accounts"
3. Crie uma nova conta FTP ou use a conta principal
4. Anote o host, usuário, senha e porta

## 🚀 Como Funciona o Deploy

### Processo de Build (GitHub Actions)

1. ✅ Faz checkout do código
2. ✅ Configura Node.js e PHP no runner
3. ✅ Instala dependências PHP (`composer install`)
4. ✅ Instala dependências Node.js (`npm ci`)
5. ✅ Compila os assets frontend (`npm run build`)
6. ✅ Cria o arquivo `.env` baseado nos GitHub Secrets
7. ✅ Compacta a aplicação em `release.zip`
8. ✅ Envia `release.zip` e `unzip.php` via FTP
9. ✅ Dispara o script `unzip.php` via HTTP para extrair os arquivos no servidor

### Processo no Servidor (Manual)

Após o upload via FTP, você precisa executar manualmente no servidor:

```bash
cd /caminho/para/sua/aplicacao
bash deploy.sh
```

O script `deploy.sh` irá:

1. ✅ Detectar se é o primeiro deploy
2. ✅ Ativar modo de manutenção (exceto no primeiro deploy)
3. ✅ Gerar `APP_KEY` automaticamente (se não fornecida)
4. ✅ Executar migrations do banco de dados
5. ✅ Otimizar a aplicação Laravel (cache de config, rotas, views)
6. ✅ Ajustar permissões das pastas `storage` e `bootstrap/cache`
7. ✅ Desativar modo de manutenção

### Primeiro Deploy vs. Deploys Subsequentes

**Primeiro Deploy:**

- Não ativa modo de manutenção
- Gera `APP_KEY` se não fornecida
- Cria arquivo `.env.deployed` para marcar que já foi feito o primeiro deploy

**Deploys Subsequentes:**

- Ativa modo de manutenção antes de executar
- Atualiza migrations
- Desativa modo de manutenção ao final

## 📦 Pré-requisitos no Servidor

Certifique-se de que o servidor tem instalado:

- **PHP 8.2+** com extensões necessárias (pdo, mbstring, xml, etc.)
- **Composer** (para instalar dependências se necessário)
- **Acesso SSH** ou **Terminal** para executar o script `deploy.sh`
- **PostgreSQL** ou **MySQL** (conforme configurado)
- **Servidor web** (Nginx/Apache) configurado para servir `public/index.php`

### Configuração do Nginx (Exemplo)

```nginx
server {
    listen 80;
    server_name seusite.com;
    root /home/usuario/public_html/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

### Configuração do Apache (.htaccess)

O Laravel já inclui um arquivo `.htaccess` na pasta `public/`. Certifique-se de que o módulo `mod_rewrite` está ativado:

```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

## 🎯 Disparar o Deploy

### Deploy Automático

O deploy é disparado automaticamente quando você faz push para a branch `main`:

```bash
git push origin main
```

### Deploy Manual

Você também pode disparar o deploy manualmente:

1. Vá para **Actions** no GitHub
2. Selecione o workflow **Deploy to Production**
3. Clique em **Run workflow**
4. Selecione a branch `main` e clique em **Run workflow**

### Executar o Script de Deploy no Servidor

Após o GitHub Actions completar o upload:

```bash
# Conectar ao servidor via SSH (se disponível)
ssh usuario@servidor.com

# Ou usar o terminal do cPanel / Plesk

# Navegar para o diretório da aplicação
cd /home/usuario/public_html

# Executar o script de deploy
bash deploy.sh
```

> 💡 **DICA**: Você pode configurar um cron job para executar o script automaticamente após cada deploy, ou usar webhooks se sua hospedagem suportar.

## 🔍 Verificação

Após o deploy, verifique:

1. ✅ O workflow completou sem erros no GitHub Actions
2. ✅ Os arquivos foram enviados para o servidor via FTP
3. ✅ O script `deploy.sh` foi executado com sucesso
4. ✅ A aplicação está acessível na URL configurada
5. ✅ O arquivo `.env` foi criado corretamente no servidor
6. ✅ As migrations foram executadas
7. ✅ Os assets foram compilados

```bash
# Conectar ao servidor e verificar
ssh usuario@servidor.com

# Verificar se o .env existe
cat /home/usuario/public_html/.env

# Verificar logs do Laravel
tail -f /home/usuario/public_html/storage/logs/laravel.log

# Verificar status das migrations
cd /home/usuario/public_html
php artisan migrate:status
```

## 🐛 Troubleshooting

### Erro de Conexão FTP

```
Error: FTP connection failed
```

**Soluções:**

- Verifique se o host, usuário e senha estão corretos
- Verifique se a porta está correta (21 para FTP, 990 para FTPS implícito)
- Tente mudar o protocolo de `ftps` para `ftp` (apenas para testes)
- Adicione `security: loose` na configuração da action no `main.yml` se houver problemas com certificado SSL
- Verifique se o firewall do servidor permite conexões FTP

### Erro de Permissão de Arquivos

```bash
# No servidor, ajuste as permissões
cd /home/usuario/public_html
chmod -R 755 storage bootstrap/cache
# Se necessário, ajuste o proprietário (substitua 'usuario' pelo seu usuário)
chown -R usuario:usuario storage bootstrap/cache
```

### Erro ao Executar Migrations

Verifique se:

- O banco de dados está acessível
- As credenciais no `.env` estão corretas
- O usuário do banco tem permissões adequadas

```bash
# Testar conexão com o banco
php artisan tinker
>>> DB::connection()->getPdo();
```

### Assets Não Carregam

```bash
# Verificar se os assets foram compilados
ls -la public/build

# Se necessário, limpar cache
php artisan config:clear
php artisan cache:clear
```

### Script deploy.sh Não Executa

```bash
# Verificar se o arquivo existe
ls -la deploy.sh

# Dar permissão de execução
chmod +x deploy.sh

# Executar manualmente
bash deploy.sh
```

## 📝 Notas Importantes

- ⚠️ O arquivo `.env` é **criado durante o build** e enviado via FTP
- ⚠️ Migrations são executadas **ao rodar o script deploy.sh no servidor**
- ⚠️ As dependências são instaladas **durante o build no GitHub Actions**
- ⚠️ Os assets são compilados **durante o build no GitHub Actions**
- ⚠️ O script `deploy.sh` deve ser executado **manualmente no servidor** após cada deploy
- ⚠️ Arquivos desnecessários (node_modules, .git, tests) **não são enviados** via FTP

## 🔒 Segurança

- ✅ Use sempre **FTPS** em produção
- ✅ Mantenha as credenciais FTP **apenas nos GitHub Secrets**
- ✅ Não commite o arquivo `.env` no repositório
- ✅ Use senhas fortes para FTP e banco de dados
- ✅ Configure permissões adequadas no servidor (755 para pastas, 644 para arquivos)
- ✅ Mantenha PHP, Composer e dependências sempre atualizados

use /www/
