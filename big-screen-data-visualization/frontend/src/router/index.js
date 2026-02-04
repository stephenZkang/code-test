import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'
import Dashboards from '../views/Dashboards.vue'
import DataSources from '../views/DataSources.vue'
import DataSets from '../views/DataSets.vue'
import DashboardView from '../views/DashboardView.vue'
import DashboardEditor from '../views/DashboardEditor.vue'
import Login from '../views/Login.vue'
import UserManagement from '../views/UserManagement.vue'
import ChangePassword from '../views/ChangePassword.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { hideNav: true, public: true }
  },
  {
    path: '/',
    redirect: '/dashboards'
  },
  {
    path: '/dashboards',
    name: 'Dashboards',
    component: Dashboards
  },
  {
    path: '/dashboard-edit/:id',
    name: 'DashboardEditor',
    component: DashboardEditor
  },
  {
    path: '/datasources',
    name: 'DataSources',
    component: DataSources
  },
  {
    path: '/datasets',
    name: 'DataSets',
    component: DataSets
  },
  {
    path: '/dashboard-view/:id?',
    name: 'DashboardView',
    component: DashboardView
  },
  {
    path: '/dashboard-share/:id',
    name: 'DashboardShare',
    component: DashboardView,
    meta: { hideNav: true, public: true }
  },
  {
    path: '/users',
    name: 'UserManagement',
    component: UserManagement,
    meta: { admin: true }
  },
  {
    path: '/change-password',
    name: 'ChangePassword',
    component: ChangePassword
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters['auth/isAuthenticated']
  const isAdmin = store.getters['auth/isAdmin']

  if (!to.meta.public && !isAuthenticated) {
    next('/login')
  } else if (to.meta.admin && !isAdmin) {
    next('/')
  } else {
    next()
  }
})

export default router
