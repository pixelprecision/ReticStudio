#!/bin/bash

# LaravelCMS Builder Installation Script
echo "Welcome to LaravelCMS Builder Installation!"
echo "----------------------------------------"
echo "This script will install and set up LaravelCMS Builder on your system."
echo ""

# Check for required software
echo "Checking for required software..."
command -v php >/dev/null 2>&1 || { echo "PHP is required but not installed. Aborting."; exit 1; }
command -v composer >/dev/null 2>&1 || { echo "Composer is required but not installed. Aborting."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "Node.js/npm is required but not installed. Aborting."; exit 1; }

# Check PHP version
PHP_VERSION=$(php -r "echo PHP_VERSION;")
PHP_VERSION_REQUIRED="8.1.0"
if [ "$(printf '%s\n' "$PHP_VERSION_REQUIRED" "$PHP_VERSION" | sort -V | head -n1)" != "$PHP_VERSION_REQUIRED" ]; then
    echo "PHP version $PHP_VERSION_REQUIRED or higher is required. You have PHP $PHP_VERSION. Aborting."
    exit 1
fi
echo "PHP version check passed: $PHP_VERSION"

# Check for PostgreSQL
command -v psql >/dev/null 2>&1 || { echo "PostgreSQL is required but not installed. Aborting."; exit 1; }
echo "PostgreSQL check passed."

echo ""
echo "All requirements met. Proceeding with installation..."
echo ""

# Create project directory
read -p "Enter project directory name (default: laravel-cms-builder): " PROJECT_DIR
PROJECT_DIR=${PROJECT_DIR:-laravel-cms-builder}

echo ""
echo "Creating project in directory: $PROJECT_DIR"
composer create-project laravel/laravel $PROJECT_DIR
cd $PROJECT_DIR

echo ""
echo "Installing required packages..."
composer require php-open-source-saver/jwt-auth
composer require laravel/telescope
composer require spatie/laravel-permission
composer require intervention/image-laravel
composer require laravel/horizon
composer require barryvdh/laravel-dompdf
composer require spatie/laravel-medialibrary
composer require doctrine/dbal

echo ""
echo "Publishing vendor packages..."
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
php artisan vendor:publish --provider="Laravel\Telescope\TelescopeServiceProvider"
php artisan vendor:publish --provider="Laravel\Horizon\HorizonServiceProvider"
php artisan vendor:publish --provider="Spatie\MediaLibrary\MediaLibraryServiceProvider"
php artisan vendor:publish --provider="PHPOpenSourceSaver\JWTAuth\Providers\LaravelServiceProvider"

echo ""
echo "Generating JWT secret key..."
php artisan jwt:secret

echo ""
echo "Setting up database..."
read -p "Enter database name (default: laravel_cms_builder): " DB_NAME
DB_NAME=${DB_NAME:-laravel_cms_builder}
read -p "Enter database username (default: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}
read -s -p "Enter database password: " DB_PASSWORD
echo ""
read -p "Enter database host (default: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}
read -p "Enter database port (default: 5432): " DB_PORT
DB_PORT=${DB_PORT:-5432}

# Update .env file with database credentials
sed -i "s/DB_CONNECTION=mysql/DB_CONNECTION=pgsql/g" .env
sed -i "s/DB_HOST=127.0.0.1/DB_HOST=$DB_HOST/g" .env
sed -i "s/DB_PORT=3306/DB_PORT=$DB_PORT/g" .env
sed -i "s/DB_DATABASE=laravel/DB_DATABASE=$DB_NAME/g" .env
sed -i "s/DB_USERNAME=root/DB_USERNAME=$DB_USER/g" .env
sed -i "s/DB_PASSWORD=/DB_PASSWORD=$DB_PASSWORD/g" .env

# Create the database (if it doesn't exist)
echo ""
echo "Creating database if it doesn't exist..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -p $DB_PORT -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "Database already exists or couldn't be created. Continuing..."

# Run migrations and seeders
echo ""
echo "Running database migrations and seeders..."
php artisan migrate --seed

# Install frontend dependencies
echo ""
echo "Installing frontend dependencies..."
npm install

# Build frontend assets
echo ""
echo "Building frontend assets..."
npm run build

# Create storage link
echo ""
echo "Creating storage link..."
php artisan storage:link

# Set appropriate permissions
echo ""
echo "Setting file permissions..."
chmod -R 775 storage bootstrap/cache

echo ""
echo "LaravelCMS Builder has been successfully installed!"
echo "You can start the development server with:"
echo "cd $PROJECT_DIR && php artisan serve"
echo ""
echo "Thank you for choosing LaravelCMS Builder!"
