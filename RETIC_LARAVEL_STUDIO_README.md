# Retic Laravel Studio

<p align="center">
<img src="public/images/retic-logo.png" width="400" alt="Retic Laravel Studio Logo">
</p>

<p align="center">
<a href="https://github.com/yourusername/retic-laravel-studio/actions"><img src="https://github.com/yourusername/retic-laravel-studio/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/yourusername/retic-laravel-studio"><img src="https://img.shields.io/packagist/v/yourusername/retic-laravel-studio" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/yourusername/retic-laravel-studio"><img src="https://img.shields.io/packagist/l/yourusername/retic-laravel-studio" alt="License"></a>
</p>

## About Retic Laravel Studio

Retic Laravel Studio is a comprehensive web application development platform that empowers users to create, customize, and deploy feature-rich websites with minimal technical knowledge. By combining the power of Laravel's robust backend with React's dynamic frontend capabilities, this solution offers an intuitive drag-and-drop interface for building responsive, database-driven web applications.

## Key Features

- **Visual Page Builder**: Create and customize web pages with a drag-and-drop interface
- **Form Builder**: Design forms and manage submissions with ease
- **Media Management**: Upload, organize, and manage media files
- **Component Library**: Extensive library of pre-designed components
- **Theme Customization**: Customize the look and feel of your site
- **Menu Builder**: Create and manage navigation menus
- **User Management**: Role-based access control system
- **SEO Tools**: Built-in SEO optimization capabilities
- **Plugin Architecture**: Extend functionality with plugins

## Documentation

For full documentation, visit [reticmedia.com/docs](https://reticmedia.com/docs).

### Quick Start Guide

1. **Installation**

```bash
# Clone the repository
git clone https://github.com/yourusername/retic-laravel-studio.git
cd retic-laravel-studio

# Install PHP dependencies
composer install

# Copy environment file and generate application key
cp .env.example .env
php artisan key:generate
php artisan jwt:secret

# Run migrations and seed the database
php artisan migrate --seed

# Install frontend dependencies
cd resources/js/admin
npm install
npm run build
cd ../../../

# Create storage link
php artisan storage:link

# Start the development server
php artisan serve
```

2. **Default Admin Login**

```
URL: http://localhost:8000/admin
Email: admin@example.com
Password: password
```

## Requirements

- PHP 8.1 or higher
- Composer
- Node.js 16.0 or higher
- npm or yarn
- PostgreSQL 13 or higher

## Tech Stack

### Backend
- Laravel 12
- PostgreSQL
- PHP 8.1+
- JWT Authentication
- Spatie Permission

### Frontend
- React 18
- Tailwind CSS
- React Router
- React Beautiful DnD

## Project Structure

```
retic-laravel-studio/
│
├── app/                         # Laravel application code
│   ├── Http/                    # HTTP layer
│   │   ├── Controllers/         # API and web controllers
│   │   ├── Middleware/          # Custom middleware
│   │   └── Resources/           # API resources/transformers
│   ├── Models/                  # Eloquent models
│   └── Providers/               # Service providers
│
├── bootstrap/                   # Laravel bootstrap files
├── config/                      # Configuration files
├── database/                    # Database related files
│   ├── migrations/              # Database migrations
│   └── seeders/                 # Database seeders
│
├── public/                      # Public accessible files
│   ├── admin/                   # Built React admin frontend
│   └── storage/                 # Public storage symlink
│
├── resources/                   # Frontend source files
│   ├── js/                      # JavaScript files
│   │   └── admin/               # React admin panel
│   │       ├── src/             # React source code
│   │       └── vite.config.js   # Vite configuration
│   └── views/                   # Laravel views
│
├── routes/                      # Laravel routes
├── storage/                     # Laravel storage
└── vendor/                      # Composer packages
```

## Core Concepts

### Content Management

Retic Laravel Studio allows you to create and manage different types of content:

- **Pages**: Full web pages with custom layouts
- **Components**: Reusable content blocks
- **Forms**: Custom forms with validation and submissions
- **Media**: Images, videos, and documents

### Page Builder

The visual page builder enables you to:

1. Drag and drop components onto the page
2. Configure component properties
3. Arrange and reorder components
4. Preview the page in real-time
5. Save revisions for version control

### Form Builder

The form builder allows you to:

1. Create custom forms with various field types
2. Set validation rules
3. Configure email notifications
4. Enable anti-spam protection
5. Manage and export form submissions

## Contributing

We welcome contributions to Retic Laravel Studio! Please see our [contributing guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/retic-laravel-studio.git
cd retic-laravel-studio

# Install dependencies
composer install
npm install --prefix resources/js/admin

# Run development servers
php artisan serve
# In another terminal
cd resources/js/admin
npm run dev
```

## Security

If you discover a security vulnerability within Retic Laravel Studio, please send an email to info@retic.media. All security vulnerabilities will be promptly addressed.

## License

Retic Laravel Studio is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Support

For support, please email support@retic-laravel-studio.com or visit our [support portal](https://reticmedia.com/support).

## Roadmap

See our [roadmap](ROADMAP.md) for future plans and upcoming features.

## Credits

- [Laravel](https://laravel.com)
- [React](https://reactjs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [All Contributors](../../contributors)
