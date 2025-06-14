import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
                                plugins: [react()],
                                root: './resources/js/admin',
                                base: '/',
                                build: {
                                    outDir: '../../../public/admin',
                                    emptyOutDir: true,
                                    manifest: true,
                                    rollupOptions: {
                                        input: './resources/js/admin/index.html', // ✅ FIXED HERE
                                    },
                                    // Ensure big modules like Monaco Editor are handled correctly
                                    chunkSizeWarningLimit: 2000,
                                },
                                optimizeDeps: {
                                    include: ['monaco-editor']
                                },
                                server: {
                                    proxy: {
                                        '/api': 'http://localhost:8000',
                                    },
                                },
                                resolve: {
                                    alias: {
                                        '@': path.resolve(__dirname, './resources/js/admin/src'),
                                        'draft-js': path.resolve(__dirname, 'node_modules/draft-js'),
                                        'react-draft-wysiwyg': path.resolve(__dirname, 'node_modules/react-draft-wysiwyg'),
                                    },
                                },
                                define: {
                                    'process.env.NODE_ENV': JSON.stringify('production'),
                                    'global': 'window',
                                },
                            });
