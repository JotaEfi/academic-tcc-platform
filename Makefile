setup:
	@make build
	@make up
	@make data

build:
	docker compose build

up:
	docker compose up

down:
	docker compose down

logs:
	docker compose logs -f

bash:
	docker compose exec app sh

db-shell:
	docker compose exec db psql -U ${DB_USERNAME} -d ${DB_DATABASE}

prune:
	docker system prune -a --volumes

data:
	docker compose exec app php artisan migrate --seed

rebuild:
	docker compose down
	docker compose up -d --build