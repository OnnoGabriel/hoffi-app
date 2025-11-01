import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import ErfassenView from '../views/ErfassenView.vue'
import SuchenView from '../views/SuchenView.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/erfassen',
    name: 'Erfassen',
    component: ErfassenView
  },
  {
    path: '/suchen',
    name: 'Suchen',
    component: SuchenView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
