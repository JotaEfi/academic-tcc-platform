#!/bin/sh
set -e

# Wait for database to be ready (simple wait)
echo "Waiting for database..."
sleep 5

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
