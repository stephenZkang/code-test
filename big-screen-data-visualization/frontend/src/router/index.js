import { createRouter, createWebHistory } from 'vue-router'
import Dashboards from '../views/Dashboards.vue'
import DataSources from '../views/DataSources.vue'
import DataSets from '../views/DataSets.vue'
import DashboardView from '../views/DashboardView.vue'
import DashboardEditor from '../views/DashboardEditor.vue'

const routes = [
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
    meta: { hideNav: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router