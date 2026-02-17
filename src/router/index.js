import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import MedicoesView from '../views/MedicoesView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'login',
            component: LoginView
        },
        {
            path: '/',
            component: MedicoesView,
            children: [
                {
                    path: '/medicoes',
                    name: 'medicoes',
                    component: () => import('../views/MedicoesView.vue')
                }
            ]
        }
    ]
})

export default router
