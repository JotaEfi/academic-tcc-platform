setup:
	@make build
	@make up
	@make sync
	@make data

build:
	docker compose build --no-cache

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

bash:
	docker compose exec app sh

db-shell:
	docker compose exec db psql -U tcc_user -d tcc_database

prune:
	docker system prune -a --volumes

data:
	docker compose exec app php artisan migrate --seed

rebuild:
	docker compose down
	docker compose up -d --build
	@make sync

# Copia os arquivos do host para o volume interno do container (sem bind mount NTFS)
# Preserva pastas internas vitais (build, node_modules, vendor) para evitar sobrescritas ou quebras
sync:
	@echo "Preservando pastas cruciais no volume (build, node_modules, vendor)..."
	-docker compose exec app sh -c "rm -rf /var/www/html/.sync_backup_build /var/www/html/.sync_backup_node_modules /var/www/html/.sync_backup_vendor && [ -d /var/www/html/public/build ] && mv /var/www/html/public/build /var/www/html/.sync_backup_build || true && [ -d /var/www/html/node_modules ] && mv /var/www/html/node_modules /var/www/html/.sync_backup_node_modules || true && [ -d /var/www/html/vendor ] && mv /var/www/html/vendor /var/www/html/.sync_backup_vendor || true"
	@echo "Sincronizando arquivos do host → volume Docker..."
	docker compose cp . app:/var/www/html/
	@echo "Restaurando pastas preservadas no volume..."
	-docker compose exec app sh -c "rm -rf /var/www/html/public/build /var/www/html/node_modules /var/www/html/vendor && [ -d /var/www/html/.sync_backup_build ] && mv /var/www/html/.sync_backup_build /var/www/html/public/build || true && [ -d /var/www/html/.sync_backup_node_modules ] && mv /var/www/html/.sync_backup_node_modules /var/www/html/node_modules || true && [ -d /var/www/html/.sync_backup_vendor ] && mv /var/www/html/.sync_backup_vendor /var/www/html/vendor || true"
	docker compose exec app chown -R www-data:www-data /var/www/html
	docker compose exec app chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache
	@echo "Sync concluido."

# Roda a build do Vite dentro do container e sincroniza de volta para o host
build-assets:
	docker compose exec app node node_modules/vite/bin/vite.js build
	docker compose cp app:/var/www/html/public/build ./public/

# Limpa caches do Laravel dentro do container
cache-clear:
	docker compose exec app php artisan optimize:clear