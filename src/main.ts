import Aura from '@primevue/themes/aura';
import { VueQueryPlugin } from '@tanstack/vue-query';
import PrimeVue from 'primevue/config';
import { createApp } from 'vue';
import App from './App.vue';
import "./assets/index.scss";
import "primeicons/primeicons.css";
import ToastService from 'primevue/toastservice';
import { createMemoryHistory, createRouter } from "vue-router";
import SearchForm from "./pages/SearchForm.vue";
import ResultList from "./pages/ResultList.vue";

const routes = [
    { path: '/', component: SearchForm },
    { path: '/list', component: ResultList },
];

const router = createRouter({
    history: createMemoryHistory(),
    routes,
});

const pinia = createPinia();

createApp(App)
    .use(VueQueryPlugin)
    .use(router)
    .use(pinia)
    .use(ToastService)
    .use(PrimeVue, { theme: { preset: Aura, options: { darkModeSelector: '' } } })
    .mount('#app');
