import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        chunkSizeWarningLimit: 900,
        rollupOptions: {
            output: {
                manualChunks: function (id) {
                    if (!id.includes('node_modules'))
                        return;
                    if (id.includes('@fullcalendar'))
                        return 'fullcalendar';
                    if (id.includes('recharts'))
                        return 'charts';
                    if (id.includes('@supabase'))
                        return 'supabase';
                    if (id.includes('@tanstack/react-query') || id.includes('zustand'))
                        return 'state';
                    if (id.includes('react-router-dom') || id.includes('react-dom') || id.includes('react'))
                        return 'react';
                    if (id.includes('lucide-react'))
                        return 'icons';
                },
            },
        },
    },
});
