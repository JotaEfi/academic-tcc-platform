#!/bin/sh
set -e

echo "======================================================"
echo "  Sistema de Gerenciamento e Avaliacao de TCCs"
echo "======================================================"

# ─── 1. APP_KEY: auto-gerar se ausente ────────────────────────────────────────
# A chave é persistida no volume de storage para sobreviver a restarts
KEY_PERSIST_FILE="/var/www/html/storage/app/.app_key"

if [ -z "$APP_KEY" ]; then
    if [ -f "$KEY_PERSIST_FILE" ]; then
        echo "[KEY] Usando APP_KEY persistida do volume anterior..."
        APP_KEY=$(cat "$KEY_PERSIST_FILE")
        export APP_KEY
    else
        echo "[KEY] APP_KEY nao definida. Gerando automaticamente..."
        APP_KEY="base64:$(php -r 'echo base64_encode(random_bytes(32));')"
        export APP_KEY
        mkdir -p "$(dirname "$KEY_PERSIST_FILE")"
        echo "$APP_KEY" > "$KEY_PERSIST_FILE"
        echo "[KEY] Chave gerada. Adicione ao seu .env para persistir:"
        echo "      APP_KEY=$APP_KEY"
    fi
else
    # Salvar a chave fornecida para uso futuro caso o env var suma
    mkdir -p "$(dirname "$KEY_PERSIST_FILE")"
    echo "$APP_KEY" > "$KEY_PERSIST_FILE"
fi

# ─── 2. Aguardar banco de dados ───────────────────────────────────────────────
if [ "$DB_CONNECTION" = "sqlite" ]; then
    echo "[DB] Usando SQLite..."
    mkdir -p /var/www/html/database
    touch /var/www/html/database/database.sqlite
    chmod 666 /var/www/html/database/database.sqlite
else
    echo "[DB] Aguardando banco PostgreSQL em $DB_HOST:$DB_PORT..."
    MAX_TRIES=30
    TRY=0
    until php -r "
        try {
            new PDO(
                'pgsql:host=' . getenv('DB_HOST') . ';port=' . getenv('DB_PORT') . ';dbname=' . getenv('DB_DATABASE'),
                getenv('DB_USERNAME'),
                getenv('DB_PASSWORD')
            );
            exit(0);
        } catch (Exception \$e) {
            exit(1);
        }
    " 2>/dev/null; do
        TRY=$((TRY + 1))
        if [ "$TRY" -ge "$MAX_TRIES" ]; then
            echo "[DB] ERRO: Banco nao respondeu apos $MAX_TRIES tentativas. Verifique as variaveis DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME e DB_PASSWORD no .env."
            exit 1
        fi
        echo "[DB] Tentativa $TRY/$MAX_TRIES — aguardando 2s..."
        sleep 2
    done
    echo "[DB] Banco disponivel."
fi

# ─── 3. Storage symlink ───────────────────────────────────────────────────────
echo "[STORAGE] Criando symlink public/storage..."
php artisan storage:link --force 2>/dev/null || true

# ─── 4. Migrations ────────────────────────────────────────────────────────────
echo "[MIGRATE] Executando migrations..."
php artisan migrate --force

# ─── 5. Seed inicial (apenas na primeira execucao do volume) ──────────────────
SEED_FLAG="/var/www/html/storage/app/.seeded"
if [ ! -f "$SEED_FLAG" ]; then
    echo "[SEED] Primeira execucao detectada. Populando banco com dados iniciais..."
    if php artisan db:seed --force; then
        touch "$SEED_FLAG"
        echo "[SEED] Concluido."
    else
        echo "[SEED] AVISO: Seed falhou. A aplicacao ainda funcionara, mas sem dados iniciais."
    fi
else
    echo "[SEED] Banco ja foi populado anteriormente. Pulando seed."
fi

# ─── 6. Permissoes de pastas criticas ────────────────────────────────────────
chmod -R 775 /var/www/html/storage
chmod -R 775 /var/www/html/bootstrap/cache

# ─── 7. Cache de configuracao ────────────────────────────────────────────────
echo "[CACHE] Cacheando configuracoes, rotas e views..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
echo "[CACHE] Concluido."

# ─── 8. Iniciar supervisor (nginx + php-fpm) ─────────────────────────────────
echo "[START] Iniciando servidor (Nginx + PHP-FPM via Supervisor)..."
echo "======================================================"
echo "  Aplicacao disponivel em http://localhost:8000"
echo "  Admin: admin@example.com / password"
echo "======================================================"
exec /usr/bin/supervisord -c /etc/supervisord.conf
