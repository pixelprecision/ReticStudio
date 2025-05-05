<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use FFMpeg\FFMpeg;
use FFMpeg\FFProbe;
use Illuminate\Support\Facades\Log;

class TestFFmpegCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ffmpeg:test';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test if FFmpeg is properly configured';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $ffmpegPath = config('media-library.ffmpeg_path');
        $ffprobePath = config('media-library.ffprobe_path');

        $this->info('Testing FFmpeg configuration');
        $this->info('FFmpeg path: ' . $ffmpegPath);
        $this->info('FFProbe path: ' . $ffprobePath);

        // Test if FFmpeg is available
        if (!file_exists($ffmpegPath)) {
            $this->error('FFmpeg not found at path: ' . $ffmpegPath);
            return 1;
        }

        if (!file_exists($ffprobePath)) {
            $this->error('FFProbe not found at path: ' . $ffprobePath);
            return 1;
        }

        $this->info('FFmpeg and FFProbe binaries found.');

        // Try to create FFMpeg instance
        try {
            $ffmpeg = FFMpeg::create([
                'ffmpeg.binaries' => $ffmpegPath,
                'ffprobe.binaries' => $ffprobePath,
                'timeout' => 3600, // 1 hour
                'ffmpeg.threads' => 12,
            ]);
            
            $this->info('Successfully created FFMpeg instance.');
            
            // Try to create FFProbe instance
            $ffprobe = FFProbe::create([
                'ffmpeg.binaries' => $ffmpegPath,
                'ffprobe.binaries' => $ffprobePath,
                'timeout' => 3600, // 1 hour
            ]);
            
            $this->info('Successfully created FFProbe instance.');
            
            $this->info('FFmpeg configuration test passed!');
            
            // Get FFmpeg version information
            $version = shell_exec($ffmpegPath . ' -version');
            $this->info('FFmpeg version information:');
            $this->line($version);
            
            return 0;
        } catch (\Exception $e) {
            $this->error('Error creating FFMpeg instance:');
            $this->error($e->getMessage());
            Log::error('FFmpeg Error: ' . $e->getMessage());
            return 1;
        }
    }
}