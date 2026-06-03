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
# Use após git pull ou alterações de código para sincronizar com o volume
sync:
	@echo "Sincronizando arquivos do host → volume Docker..."
	docker compose cp . app:/var/www/html/
	docker compose exec app chown -R www-data:www-data /var/www/html
	docker compose exec app chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache
	@echo "Sync concluido."

# Roda npm run build dentro do container (build fica no volume, sem NTFS)
build-assets:
	docker compose exec app npm run build

# Limpa caches do Laravel dentro do container
cache-clear:
	docker compose exec app php artisan optimize:clear