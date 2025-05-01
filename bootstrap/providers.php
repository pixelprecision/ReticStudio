<?php

return [
    App\Providers\AppServiceProvider::class,
    App\Providers\CmsServiceProvider::class,
    App\Providers\TelescopeServiceProvider::class,
    Intervention\Image\Laravel\ServiceProvider::class,
    PHPOpenSourceSaver\JWTAuth\Providers\LaravelServiceProvider::class,
    Spatie\MediaLibrary\MediaLibraryServiceProvider::class,
    Spatie\Permission\PermissionServiceProvider::class,
];
