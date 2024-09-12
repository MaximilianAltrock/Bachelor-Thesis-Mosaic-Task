import AppLayout from '@/layout/AppLayout.vue';
import { useLayout } from '@/layout/composables/layout';
import { useAuthStore } from '@/stores/auth';
import { createRouter, createWebHistory } from 'vue-router';
const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'landing',
            component: () => import('@/views/pages/Landing.vue')
        },
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: 'dashboard',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: 'journal',
                    name: 'journal',
                    component: () => import('@/views/Journal.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: 'board/:boardId',
                    name: 'taskManagement',
                    component: () => import('@/views/TaskManagement.vue'),
                    props: true,
                    meta: { requiresAuth: true }
                }
            ]
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },

        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/auth/register',
            name: 'register',
            component: () => import('@/views/pages/auth/Register.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        }
    ]
});

router.beforeEach((to, from, next) => {
    const { isTaskSidebarVisible, toggleTaskSidebar } = useLayout();
    const authStore = useAuthStore();

    if (isTaskSidebarVisible.value) {
        toggleTaskSidebar();
    }

    if (to.matched.some((record) => record.meta.requiresAuth)) {
        if (!authStore.isAuthenticated) {
            next({ name: 'login' });
        } else {
            next();
        }
    } else {
        next();
    }
});
export default router;
