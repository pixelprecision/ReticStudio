<?php
	// app/Providers/CmsServiceProvider.php
	
	namespace App\Providers;
	
	use Illuminate\Support\ServiceProvider;
	use Illuminate\Support\Facades\Route;
	use Illuminate\Support\Facades\Gate;
	use Spatie\Permission\Models\Role;
	use Spatie\Permission\Models\Permission;
	
	class CmsServiceProvider extends ServiceProvider
	{
		/**
		 * Register services.
		 */
		public function register(): void
		{
			// Register the CMS config
			$this->mergeConfigFrom(
				__DIR__ . '/../../config/cms.php', 'cms'
			);
		}
		
		/**
		 * Bootstrap services.
		 */
		public function boot(): void
		{
			// Register the CMS permissions
			$this->registerPermissions();
			
			// Register the CMS commands
			if ($this->app->runningInConsole()) {
				$this->commands([
					// List your console commands here
				]);
			}
			
			// Publish the CMS config
			$this->publishes([
				__DIR__ . '/../../config/cms.php' => config_path('cms.php'),
			], 'cms-config');
		}
		
		
		/**
		 * Register the CMS permissions.
		 */
		protected function registerPermissions(): void
		{
			// Define permissions for different entities
			$permissions = [
				// Pages
				'pages.view',
				'pages.create',
				'pages.edit',
				'pages.delete',
				'pages.publish',
				
				// Components
				'components.view',
				'components.create',
				'components.edit',
				'components.delete',
				
				// Forms
				'forms.view',
				'forms.create',
				'forms.edit',
				'forms.delete',
				'forms.submissions.view',
				'forms.submissions.delete',
				
				// Settings
				'settings.view',
				'settings.edit',
				
				// Themes
				'themes.view',
				'themes.create',
				'themes.edit',
				'themes.delete',
				'themes.activate',
				
				// Media
				'media.view',
				'media.upload',
				'media.edit',
				'media.delete',
				
				// Menus
				'menus.view',
				'menus.create',
				'menus.edit',
				'menus.delete',
				
				// Plugins
				'plugins.view',
				'plugins.install',
				'plugins.activate',
				'plugins.configure',
				'plugins.uninstall',
				
				// Users
				'users.view',
				'users.create',
				'users.edit',
				'users.delete',
				
				// Roles
				'roles.view',
				'roles.create',
				'roles.edit',
				'roles.delete',
			];
			
			// Create permissions if they don't exist
			foreach ($permissions as $permission) {
				Permission::firstOrCreate(['name' => $permission]);
			}
			
			// Define default roles
			$roles = [
				'admin' => $permissions, // Admin has all permissions
				'editor' => [
					'pages.view',
					'pages.create',
					'pages.edit',
					'pages.publish',
					'components.view',
					'forms.view',
					'forms.create',
					'forms.edit',
					'forms.submissions.view',
					'media.view',
					'media.upload',
					'media.edit',
					'menus.view',
					'menus.edit',
				],
				'author' => [
					'pages.view',
					'pages.create',
					'pages.edit',
					'media.view',
					'media.upload',
				],
				'user' => [
					'pages.view',
					'media.view',
				],
			];
			
			// Create roles if they don't exist and assign permissions
			foreach ($roles as $roleName => $rolePermissions) {
				$role = Role::firstOrCreate(['name' => $roleName]);
				
				// Sync permissions
				$permissionObjects = Permission::whereIn('name', $rolePermissions)->get();
				$role->syncPermissions($permissionObjects);
			}
			
			// Define gates for permissions
			foreach ($permissions as $permission) {
				Gate::define($permission, function ($user) use ($permission) {
					return $user->hasPermissionTo($permission);
				});
			}
		}
	}
