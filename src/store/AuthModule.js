import AuthService from '../services/AuthService';
import router from '../router/index'

const AuthModule = {
  state: {
    user: null
  },
  mutations: {
    redirectToTwitter (state, url) {
      window.location.href = url;
    },
    setUser (state, user) {
      state.user = user;
    }
  },
  actions: {
    signUserIn ({commit}, payload) {
      commit('setLoading', true)
      commit('clearError')
      AuthService.signIn().then(response => {
        var url = response.data.url;
        commit('redirectToTwitter', url);
      })
      .catch (
        error => {
          commit('setLoading', false)
          commit('setError', error)
        }
      )
    },
    logout ({commit}, payload) {
      AuthService.signOut().then(response => {
        commit('setUser', null);
        router.push('/login');
      })
    }
  },
  getters: {
    user (state) {
      return state.user
    }
  }
}

export default AuthModule
