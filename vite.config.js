import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import glsl from 'vite-plugin-glsl'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        glsl(),
    ],
    server: {
        host: true,
    },
    resolve: {
        dedupe: ['three', 'three-stdlib'],
    },
})
