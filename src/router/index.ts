import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import Login from '../views/Login.vue';
import MainLayout from '../components/layout/MainLayout.vue';

const routes: RouteRecordRaw[] = [
    {
        path: '/login',
        name: 'Login',
        component: Login,
    },
    {
        path: '/',
        name: 'Main',
        component: MainLayout,
        children: [
            { path: 'games', name: 'GameList', component: () => import('../views/GameList.vue') }, // 新增：游戏管理路由
            { path: 'add-game', name: 'AddGame', component: () => import('../views/AddGame.vue') },
            {path: '/edit-character',name: 'CharacterEditor',component: () => import('../views/CharacterEditor.vue')},
            {path: '/edit-location',name: 'LocationEditor',component: () => import('../views/LocationEditor.vue')}
        ],
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

// 路由守卫：未登录用户重定向到登录页
router.beforeEach((to, from, next) => {
    const isLoggedIn = localStorage.getItem('mock-token');
    if (to.name !== 'Login' && !isLoggedIn) next({ name: 'Login' });
    else next();
});

export default router;
