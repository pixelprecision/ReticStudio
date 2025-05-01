<?php
	//database/seeders/MediaCollectionSeeder.php
	
	namespace Database\Seeders;
	
	use App\Models\MediaCollection;
	use Illuminate\Database\Seeder;
	
	class MediaCollectionSeeder extends Seeder
	{
		/**
		 * Run the database seeds.
		 */
		public function run(): void
		{
			// Create default media collections
			$collections = [
				[
					'name' => 'Images',
					'slug' => 'images',
					'description' => 'General images collection.',
				],
				[
					'name' => 'Documents',
					'slug' => 'documents',
					'description' => 'Documents and file attachments.',
				],
				[
					'name' => 'Featured Images',
					'slug' => 'featured-images',
					'description' => 'Featured images for pages and content.',
				],
				[
					'name' => 'Uploads',
					'slug' => 'uploads',
					'description' => 'User uploaded files.',
				],
			];
			
			foreach ($collections as $collection) {
				MediaCollection::create($collection);
			}
		}
	}
	
	
	
	
	

	
	
	
