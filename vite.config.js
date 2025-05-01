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
                                },
                                server: {
                                    proxy: {
                                        '/api': 'http://localhost:8000',
                                    },
                                },
                                resolve: {
                                    alias: {
                                        '@': path.resolve(__dirname, './resources/js/admin/src'),
                                    },
                                },
                            });
