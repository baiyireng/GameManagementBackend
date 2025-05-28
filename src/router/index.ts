import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import Login from '../views/Login.vue';
import MainLayout from '../components/layout/MainLayout.vue';
// 示例子页面（需自行创建）
// import GameList from '../views/GameList.vue';
// import UserList from '../views/UserList.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    name: 'Main',
    component: MainLayout,
    children: [
    //   { path: 'games', name: 'GameList', component: GameList },
    //   { path: 'users', name: 'UserList', component: UserList }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// 路由守卫：未登录用户重定向到登录页
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('mock-token');
  if (to.name !== 'Login' && !isLoggedIn) next({ name: 'Login' });
  else next();
});

export default router;