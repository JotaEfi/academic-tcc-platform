# Compila os assets usando o Vite no container e copia de volta para o host Windows
# Isso garante que a versão compilada esteja sincronizada no Windows e previne perdas

Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host "  Compilando Assets no Container & Sincronizando com Host" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Yellow

Write-Host "Executando compilação do Vite no container..." -ForegroundColor Cyan
docker compose exec app node node_modules/vite/bin/vite.js build

Write-Host "Sincronizando arquivos compilados do container para o host..." -ForegroundColor Cyan
docker compose cp app:/var/www/html/public/build ./public/

Write-Host "Limpando caches do Laravel..." -ForegroundColor Cyan
docker compose exec app php artisan optimize:clear

Write-Host "Compilação e sincronização concluídas!" -ForegroundColor Green
