import { createApp } from 'vue';
import './styles/main.scss';
import 'element-plus/dist/index.css'; // Add this line to import Element Plus core styles
import App from './App.vue';
import router from './router';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

const app = createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(router).mount('#app');
