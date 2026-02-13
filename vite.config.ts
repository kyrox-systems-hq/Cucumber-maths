import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    root: 'src/client',
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@shared': path.resolve(__dirname, 'src/shared'),
            '@client': path.resolve(__dirname, 'src/client'),
            '@server': path.resolve(__dirname, 'src/server'),
        },
    },
    build: {
        outDir: path.resolve(__dirname, 'dist/client'),
        emptyOutDir: true,
    },
    server: {
        port: 5173,
        proxy: {
            '/api': 'http://localhost:3001',
            '/ws': {
                target: 'ws://localhost:3001',
                ws: true,
            },
        },
    },
});
