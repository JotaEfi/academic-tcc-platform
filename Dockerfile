# Stage 1: Build Frontend Assets
FROM node:20-alpine as frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV SKIP_WAYFINDER=true
RUN npm run build

# Stage 2: Build Backend Dependencies
FROM composer:2 as composer
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist
COPY . .
RUN composer dump-autoload --optimize

# Stage 3: Production Image
FROM php:8.3-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    nginx \
    postgresql-dev \
    libzip-dev \
    zip \
    unzip \
    supervisor \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_pgsql zip gd bcmath

# Configure Nginx
COPY docker/nginx/nginx.conf /etc/nginx/http.d/default.conf

# Configure PHP-FPM
COPY docker/php/local.ini /usr/local/etc/php/conf.d/local.ini

# Configure Supervisor
COPY docker/supervisor/supervisord.conf /etc/supervisord.conf

# Set working directory
WORKDIR /var/www/html

# Copy application code
COPY --from=composer /app /var/www/html
COPY --from=frontend /app/public/build /var/www/html/public/build

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

# Copy entrypoint
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
