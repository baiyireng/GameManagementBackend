import { createApp } from 'vue';
import './styles/main.scss';
import 'element-plus/dist/index.css'; // Add this line to import Element Plus core styles
import App from './App.vue';
import router from './router';

createApp(App).use(router).mount('#app');
