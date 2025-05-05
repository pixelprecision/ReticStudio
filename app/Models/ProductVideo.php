<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductVideo extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'product_id',
        'title',
        'description',
        'url',
        'video_type',
        'thumbnail_path',
        'sort_order',
        'is_featured',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'sort_order' => 'integer',
        'is_featured' => 'boolean',
    ];

    /**
     * Video types
     */
    const TYPE_YOUTUBE = 'youtube';
    const TYPE_VIMEO = 'vimeo';
    const TYPE_HTML5 = 'html5';
    const TYPE_EMBED = 'embed';

    /**
     * Get the product that owns the video.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the embed code for the video.
     *
     * @param int $width
     * @param int $height
     * @return string|null
     */
    public function getEmbedCode($width = 640, $height = 360)
    {
        switch ($this->video_type) {
            case self::TYPE_YOUTUBE:
                // Extract YouTube video ID
                $pattern = '/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i';
                if (preg_match($pattern, $this->url, $matches)) {
                    $videoId = $matches[1];
                    return "<iframe width=\"{$width}\" height=\"{$height}\" src=\"https://www.youtube.com/embed/{$videoId}\" frameborder=\"0\" allowfullscreen></iframe>";
                }
                break;

            case self::TYPE_VIMEO:
                // Extract Vimeo video ID
                $pattern = '/(https?:\/\/)?(www\.)?(vimeo\.com\/)([0-9]+)/i';
                if (preg_match($pattern, $this->url, $matches)) {
                    $videoId = $matches[4];
                    return "<iframe width=\"{$width}\" height=\"{$height}\" src=\"https://player.vimeo.com/video/{$videoId}\" frameborder=\"0\" allowfullscreen></iframe>";
                }
                break;

            case self::TYPE_HTML5:
                return "<video width=\"{$width}\" height=\"{$height}\" controls>
                            <source src=\"{$this->url}\" type=\"video/mp4\">
                            Your browser does not support the video tag.
                        </video>";

            case self::TYPE_EMBED:
                // Return the embed code as is for custom embeds
                return $this->url;
        }

        return null;
    }

    /**
     * Scope a query to only include featured videos.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope a query to order videos by sort_order.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSorted($query)
    {
        return $query->orderBy('sort_order');
    }
}