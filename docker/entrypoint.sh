#!/bin/sh
set -e

if [ "$DB_CONNECTION" = "sqlite" ]; then
    echo "Using SQLite database..."
    mkdir -p /var/www/html/database
    touch /var/www/html/database/database.sqlite
    chmod 666 /var/www/html/database/database.sqlite
else
    echo "Waiting for database..."
    sleep 5
fi

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Cache configuration
echo "Caching configuration..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start supervisor
echo "Starting supervisor..."
exec /usr/bin/supervisord -c /etc/supervisord.conf
