// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/pages/LoginPage.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'login',
            component: LoginPage
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: () => import('@/pages/DashboardPage.vue')
        }
    ]
})

export default router