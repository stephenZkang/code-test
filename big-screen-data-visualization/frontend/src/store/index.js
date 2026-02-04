import { createStore } from 'vuex'

export default createStore({
  state: {
    datasources: [],
    datasets: [],
    dashboards: [],
    currentDashboard: null
  },
  mutations: {
    SET_DATASOURCES(state, datasources) {
      state.datasources = datasources
    },
    SET_DATASETS(state, datasets) {
      state.datasets = datasets
    },
    SET_DASHBOARDS(state, dashboards) {
      state.dashboards = dashboards
    },
    SET_CURRENT_DASHBOARD(state, dashboard) {
      state.currentDashboard = dashboard
    }
  },
  actions: {
    async fetchDatasources({ commit }) {
      try {
        const response = await fetch('http://localhost:8000/api/datasources')
        const data = await response.json()
        commit('SET_DATASOURCES', data)
      } catch (error) {
        console.error('Error fetching datasources:', error)
      }
    },
    async fetchDatasets({ commit }) {
      try {
        const response = await fetch('http://localhost:8000/api/datasets')
        const data = await response.json()
        commit('SET_DATASETS', data)
      } catch (error) {
        console.error('Error fetching datasets:', error)
      }
    },
    async fetchDashboards({ commit }) {
      try {
        const response = await fetch('http://localhost:8000/api/dashboards')
        const data = await response.json()
        commit('SET_DASHBOARDS', data)
      } catch (error) {
        console.error('Error fetching dashboards:', error)
      }
    }
  },
  getters: {
    getDatasourceById: (state) => (id) => {
      return state.datasources.find(ds => ds.id === id)
    },
    getDatasetById: (state) => (id) => {
      return state.datasets.find(ds => ds.id === id)
    },
    getDashboardById: (state) => (id) => {
      return state.dashboards.find(db => db.id === id)
    }
  }
})