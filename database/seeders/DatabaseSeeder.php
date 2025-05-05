<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
	    // Seed the database with initial data
	    $this->call([
		    RoleSeeder::class,
		    UserSeeder::class,
		    SettingSeeder::class,
		    ComponentSeeder::class,
			TailwindImageHeroSeeder::class,
			StoreComponentSeeder::class,
		    ThemeSeeder::class,
		    MediaCollectionSeeder::class,
		    MenuSeeder::class,
		    FormSeeder::class,
		    PageSeeder::class,
		    PluginSeeder::class,
	    ]);
    }
}
