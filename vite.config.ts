import { PrimeVueResolver } from '@primevue/auto-import-resolver';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        AutoImport({
            dts: "dts/auto-imports.d.ts",
            imports: ["vue", "@vueuse/core", "vee-validate", "pinia", "vue-router"],
            dirs: ["src/api"]
        }),
        Components({
            dts: "dts/components.d.ts",
            resolvers: [PrimeVueResolver()],
        })
    ],
})
