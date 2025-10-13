import {createRouter, createWebHistory} from '@ionic/vue-router';
import {RouteRecordRaw} from 'vue-router';
import MainView from '~/MainView.vue'
import LoginPage from "~/LoginPage.vue";

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/home',
        meta: { requiresAuth: true }
    },
    {
        path: '/login',
        component: LoginPage
    },
    {
        path: '/',
        component: MainView,
        meta: {requiresAuth: true},
        children: [
            {
                path: '',
                redirect: '/home'
            },
            {
                path: 'home',
                component: () => import('~/HomePage.vue'),
                meta: {requiresAuth: true}
            },
            {
                path: 'notifications',
                component: () => import('~/CriticalPage.vue'),
                meta: {requiresAuth: true}
            },
            {
                path: 'settings',
                component: () => import('~/SettingsPage.vue'),
                meta: {requiresAuth: true}
            },
            {
                path: 'articles',
                component: () => import('~/ArticleListPage.vue'),
                meta: {requiresAuth: true}
            },
            {
                path: 'scanner',
                component: () => import('~/BarcodeScanner.vue'),
                meta: {requiresAuth: true}
            },
            {
                path: 'critical',
                component: () => import('~/CriticalPage.vue'),
                meta: {requiresAuth: true}
            },
            {
                path: 'request',
                component: () => import('~/RequestPage.vue'),
                meta: {requiresAuth: true}
            }
        ]
    },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

router.beforeEach((to, from, next) => {
   const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
   if ( to.meta.requiresAuth && !isAuthenticated) {
         next('/login');
   } else if (to.path === "/login" && isAuthenticated) {
       next("/home");
   } else {
       next();
   }
});

export default router
