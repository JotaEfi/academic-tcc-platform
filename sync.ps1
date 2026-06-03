# Sincroniza os arquivos do host Windows para o volume Docker do container
# Preserva pastas cruciais do container para evitar quebras de dependências ou regressão de build

Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host "  Sincronizando Host -> Container (Preservando Volumes)" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Yellow

Write-Host "Preservando pastas cruciais no volume (build, node_modules, vendor)..." -ForegroundColor Cyan
docker compose exec app sh -c "rm -rf /var/www/html/.sync_backup_build /var/www/html/.sync_backup_node_modules /var/www/html/.sync_backup_vendor && [ -d /var/www/html/public/build ] && mv /var/www/html/public/build /var/www/html/.sync_backup_build || true && [ -d /var/www/html/node_modules ] && mv /var/www/html/node_modules /var/www/html/.sync_backup_node_modules || true && [ -d /var/www/html/vendor ] && mv /var/www/html/vendor /var/www/html/.sync_backup_vendor || true"

Write-Host "Sincronizando arquivos do host -> volume Docker..." -ForegroundColor Cyan
docker compose cp . app:/var/www/html/

Write-Host "Restaurando pastas preservadas no volume..." -ForegroundColor Cyan
docker compose exec app sh -c "rm -rf /var/www/html/public/build /var/www/html/node_modules /var/www/html/vendor && [ -d /var/www/html/.sync_backup_build ] && mv /var/www/html/.sync_backup_build /var/www/html/public/build || true && [ -d /var/www/html/.sync_backup_node_modules ] && mv /var/www/html/.sync_backup_node_modules /var/www/html/node_modules || true && [ -d /var/www/html/.sync_backup_vendor ] && mv /var/www/html/.sync_backup_vendor /var/www/html/vendor || true"

docker compose exec app chown -R www-data:www-data /var/www/html
docker compose exec app chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

Write-Host "Limpando caches de rotas e configuracoes no container..." -ForegroundColor Cyan
docker compose exec app php artisan route:clear
docker compose exec app php artisan config:clear

Write-Host "Verificando integridade do banco de dados..." -ForegroundColor Cyan
docker compose exec app php artisan tinker --execute="if (\App\Models\User::count() === 0) { echo 'Banco de dados vazio! Populando...'; \Artisan::call('db:seed', ['--force' => true]); }"

Write-Host "Sincronização concluída com sucesso!" -ForegroundColor Green
