import axios from 'axios'

const state = {
  token: localStorage.getItem('token') || '',
  user: JSON.parse(localStorage.getItem('user')) || null
}

const mutations = {
  SET_TOKEN(state, token) {
    state.token = token
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  },
  SET_USER(state, user) {
    state.user = user
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  }
}

const actions = {
  async login({ commit }, authData) {
    const params = new URLSearchParams()
    params.append('username', authData.username)
    params.append('password', authData.password)

    const response = await axios.post('http://localhost:8000/api/users/login', params)
    const { access_token } = response.data
    commit('SET_TOKEN', access_token)
    
    // 获取用户信息
    const userResponse = await axios.get('http://localhost:8000/api/users/me', {
      headers: { Authorization: `Bearer ${access_token}` }
    })
    commit('SET_USER', userResponse.data)
    return userResponse.data
  },
  logout({ commit }) {
    commit('SET_TOKEN', '')
    commit('SET_USER', null)
  },
  async fetchMe({ commit, state }) {
    if (!state.token) return null
    try {
      const response = await axios.get('http://localhost:8000/api/users/me', {
        headers: { Authorization: `Bearer ${state.token}` }
      })
      commit('SET_USER', response.data)
      return response.data
    } catch (error) {
      commit('SET_TOKEN', '')
      commit('SET_USER', null)
      throw error
    }
  }
}

const getters = {
  isAuthenticated: state => !!state.token,
  currentUser: state => state.user,
  isAdmin: state => state.user?.is_admin || false
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
