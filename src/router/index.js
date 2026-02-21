import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import MedicoesView from '../views/MedicoesView.vue'
import MedidaCorporalView from '../views/MedidaCorporalView.vue'
import DashboardView from '../views/DashboardView.vue'
//import { isAuthenticated } from '../servers/authService'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'login',
            component: LoginView
        },
        {
            path: '/medicoes',
            name: 'medicoes',
            component: MedicoesView,
            meta: { requiresAuth: true } // O "segurança" vai olhar para isso aqui
        },
        {
            path: '/medicao-corporal',
            name: 'medicao-corporal',
            component: MedidaCorporalView,
            meta: { requiresAuth: true } // O "segurança" vai olhar para isso aqui
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: DashboardView,
            meta: { requiresAuth: true }
        }
    ]
})

// router.beforeEach((to, from, next) => {
//     if (to.meta.requiresAuth && !isAuthenticated()) {
//         next({ name: 'login' })
//     } else {
//         next()
//     }
// })

export default router
