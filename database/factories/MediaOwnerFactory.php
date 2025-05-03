<?php

namespace Database\Factories;

use App\Models\MediaOwner;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class MediaOwnerFactory extends Factory
{
    protected $model = MediaOwner::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'created_by' => User::factory(),
            'updated_by' => fn (array $attributes) => $attributes['created_by'],
        ];
    }
}