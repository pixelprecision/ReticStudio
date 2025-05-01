# Retic Laravel Studio Deployment Guide

This guide provides detailed instructions for deploying the Retic Laravel Studio application to production environments.

## Table of Contents

1. [Server Requirements](#server-requirements)
2. [Deployment Options](#deployment-options)
3. [Manual Deployment Process](#manual-deployment-process)
4. [Using Laravel Forge](#using-laravel-forge)
5. [Using Docker](#using-docker)
6. [SSL Configuration](#ssl-configuration)
7. [Database Setup](#database-setup)
8. [File Storage Configuration](#file-storage-configuration)
9. [Environment Variables](#environment-variables)
10. [Performance Optimization](#performance-optimization)
11. [Monitoring and Logging](#monitoring-and-logging)
12. [Maintenance Mode](#maintenance-mode)
13. [Troubleshooting](#troubleshooting)

## Server Requirements

- PHP 8.1+
- Composer 2.0+
- Node.js 16+ and npm/yarn
- PostgreSQL 13+
- Nginx or Apache web server
- SSL certificate
- Minimum 2GB RAM
- 20GB disk space

## Deployment Options

### Managed Hosting Services

- **Laravel Forge**: Automated server provisioning and deployment
- **Laravel Vapor**: Serverless deployment on AWS Lambda
- **Ploi.io**: Server management and deployment platform
- **Cloudways**: Managed cloud hosting with Laravel support

### Self-Hosted Options

- Digital Ocean, AWS, Google Cloud, Azure
- VPS providers (Linode, Vultr, etc.)
- Docker containers

## Manual Deployment Process

### 1. Prepare the Server

```bash
# Update server packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y php8.1-fpm php8.1-cli php8.1-pgsql php8.1-gd php8.1-xml \
php8.1-mbstring php8.1-zip php8.1-curl php8.1-intl php8.1-bcmath nginx postgresql

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Node.js
curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. Configure Web Server (Nginx)

Create a new Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/laravel-cms
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/laravel-cms-builder/public;

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
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Enable the site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/laravel-cms /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

### 3. Deploy the Application

```bash
# Clone the repository
git clone https://github.com/your-repo/laravel-cms-builder.git /var/www/laravel-cms-builder
cd /var/www/laravel-cms-builder

# Install dependencies
composer install --no-dev --optimize-autoloader
npm install --prefix resources/js/admin

# Set proper permissions
sudo chown -R www-data:www-data /var/www/laravel-cms-builder
sudo chmod -R 755 /var/www/laravel-cms-builder
sudo chmod -R 775 /var/www/laravel-cms-builder/storage
sudo chmod -R 775 /var/www/laravel-cms-builder/bootstrap/cache

# Set up environment
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
php artisan storage:link

# Build frontend assets
npm run build --prefix resources/js/admin

# Run migrations
php artisan migrate --seed

# Cache configurations for better performance
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Using Laravel Forge

1. Create a new server in Forge
2. Create a new site and connect to GitHub/GitLab repository
3. Configure deployment script:

```bash
cd $FORGE_SITE_PATH
git pull origin $FORGE_SITE_BRANCH
composer install --no-dev --optimize-autoloader
npm install --prefix resources/js/admin
npm run build --prefix resources/js/admin
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

4. Set up environment variables in Forge dashboard
5. Enable scheduled tasks for Laravel scheduler
6. Set up database backups

## Using Docker

### 1. Create Docker-compose file

Create a `docker-compose.yml` file:

```yaml
version: '3'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    image: laravel-cms-builder
    container_name: laravel-cms-app
    restart: unless-stopped
    volumes:
      - ./:/var/www/html
      - ./storage:/var/www/html/storage
    networks:
      - laravel-cms-network
    depends_on:
      - db

  webserver:
    image: nginx:alpine
    container_name: laravel-cms-webserver
    restart: unless-stopped
    ports:
      - "80:80"
    volumes:
      - ./:/var/www/html
      - ./docker/nginx/conf.d:/etc/nginx/conf.d
    networks:
      - laravel-cms-network
    depends_on:
      - app

  db:
    image: postgres:13
    container_name: laravel-cms-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_DATABASE}
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - laravel-cms-network

networks:
  laravel-cms-network:
    driver: bridge

volumes:
  pgdata:
    driver: local
```

### 2. Create Dockerfile

```dockerfile
FROM php:8.1-fpm

# Install dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_pgsql pgsql zip exif pcntl gd

# Install Node.js
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get install -y nodejs

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . .

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Expose port
EXPOSE 9000

# Start PHP-FPM server
CMD ["php-fpm"]
```

### 3. Start Docker containers

```bash
docker-compose up -d
docker-compose exec app php artisan key:generate
docker-compose exec app php artisan jwt:secret
docker-compose exec app php artisan migrate --seed
docker-compose exec app php artisan storage:link
docker-compose exec app composer install --no-dev --optimize-autoloader
docker-compose exec app npm install --prefix resources/js/admin
docker-compose exec app npm run build --prefix resources/js/admin
docker-compose exec app php artisan config:cache
docker-compose exec app php artisan route:cache
docker-compose exec app php artisan view:cache
```

## SSL Configuration

### Using Let's Encrypt with Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Manual SSL Configuration

Update your Nginx config to include SSL:

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # Rest of your configuration...
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}
```

## Database Setup

### 1. Configure PostgreSQL

```bash
sudo -u postgres psql

postgres=# CREATE DATABASE laravel_cms_builder;
postgres=# CREATE USER laravel_user WITH ENCRYPTED PASSWORD 'your_secure_password';
postgres=# GRANT ALL PRIVILEGES ON DATABASE laravel_cms_builder TO laravel_user;
postgres=# \q
```

### 2. Update .env file

```
DB_CONNECTION=pgsql
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=laravel_cms_builder
DB_USERNAME=laravel_user
DB_PASSWORD=your_secure_password
```

## File Storage Configuration

### Local Storage

Ensure storage directories are writable:

```bash
chmod -R 775 storage
chmod -R 775 bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
php artisan storage:link
```

### Cloud Storage (S3)

Install AWS SDK:

```bash
composer require league/flysystem-aws-s3-v3 "^3.0"
```

Update .env:

```
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_DEFAULT_REGION=your_region
AWS_BUCKET=your_bucket
```

## Environment Variables

Critical environment variables for production:

```
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=pgsql
DB_HOST=your_database_host
DB_PORT=5432
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
REDIS_HOST=your_redis_host

MAIL_MAILER=smtp
MAIL_HOST=your_mail_host
MAIL_PORT=587
MAIL_USERNAME=your_mail_username
MAIL_PASSWORD=your_mail_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your_email@example.com
MAIL_FROM_NAME="${APP_NAME}"

JWT_SECRET=your_jwt_secret
JWT_TTL=60
```

## Performance Optimization

### PHP Optimization

Update `php.ini`:

```ini
memory_limit = 256M
max_execution_time = 60
opcache.enable=1
opcache.memory_consumption=128
opcache.interned_strings_buffer=8
opcache.max_accelerated_files=4000
opcache.revalidate_freq=60
opcache.fast_shutdown=1
```

### Laravel Performance Optimization

```bash
# Cache configurations
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Clear caches during deployment
php artisan optimize:clear
php artisan optimize
```

### Web Server Optimization

Enable Gzip compression and browser caching in Nginx:

```nginx
# Inside server block
gzip on;
gzip_comp_level 5;
gzip_min_length 256;
gzip_proxied any;
gzip_types
  application/javascript
  application/json
  application/xml
  text/css
  text/plain
  text/xml;

location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 30d;
    add_header Cache-Control "public, no-transform";
}
```

## Monitoring and Logging

### Laravel Telescope (Development)

Install and configure Laravel Telescope for advanced request monitoring.

### Laravel Horizon (Production)

For monitoring Redis queues in production.

### Setting Up Error Logging

Integrate with external monitoring services:

```bash
# Install Sentry SDK
composer require sentry/sentry-laravel

# Configure in .env
SENTRY_LARAVEL_DSN=your_sentry_dsn
```

## Maintenance Mode

Enable maintenance mode during deployments:

```bash
php artisan down --message="Upgrading Database" --retry=60
# Perform maintenance tasks
php artisan up
```

## Troubleshooting

### Common Issues

1. **Permission Errors**:
    - Ensure storage and bootstrap/cache folders are writable
    - Fix with: `chmod -R 775 storage bootstrap/cache`

2. **Database Connection Issues**:
    - Verify database credentials
    - Check PostgreSQL is running: `sudo systemctl status postgresql`

3. **500 Server Errors**:
    - Check Laravel logs: `tail -f storage/logs/laravel.log`
    - Verify correct PHP extensions are installed

4. **White Screen / Blank Page**:
    - Enable error display temporarily in `.env`: `APP_DEBUG=true`
    - Check Nginx/Apache error logs

5. **JWT Token Issues**:
    - Regenerate JWT secret: `php artisan jwt:secret`
    - Clear cache: `php artisan cache:clear`

### Debugging Tips

1. Verify configurations:
   ```bash
   php artisan config:clear
   php artisan route:list
   ```

2. Test database connection:
   ```bash
   php artisan tinker
   DB::connection()->getPdo();
   ```

3. Check server capabilities:
   ```bash
   php artisan --version
   php -v
   ```

## Security Best Practices

1. Keep all software updated (PHP, Laravel, packages)
2. Use environment variables for sensitive information
3. Implement rate limiting for API endpoints
4. Enable HTTPS and configure proper SSL settings
5. Set up automated backups
6. Use strong, randomly generated passwords
7. Implement proper CORS policies
8. Regularly audit user permissions
9. Keep APP_DEBUG=false in production
10. Use a Web Application Firewall (WAF) like Cloudflare
