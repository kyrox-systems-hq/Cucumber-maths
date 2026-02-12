import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@shared': path.resolve(__dirname, 'src/shared'),
            '@client': path.resolve(__dirname, 'src/client'),
            '@server': path.resolve(__dirname, 'src/server'),
        },
    },
    test: {
        include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
        coverage: {
            provider: 'v8',
        },
    },
});
