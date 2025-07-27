// store.js
const store = new Vuex.Store({
  state: {
    auth_token: null,
    role: null,
    loggedIn: false,
    user_id: null
  },
  mutations: {
    setUser(state) {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          if (user.token && user.id && user.role) {
            state.auth_token = user.token;
            state.role = user.role;
            state.user_id = user.id;
            state.loggedIn = true;
          }
        }
      } catch (err) {
        console.warn("Failed to load user from localStorage:", err);
      }
    },
    logout(state) {
      state.auth_token = null;
      state.role = null;
      state.loggedIn = false;
      state.user_id = null;
      localStorage.removeItem("user");
    }
  },
  actions: {
    login({ commit }, userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      commit("setUser");
    },
    logout({ commit }) {
      commit("logout");
    }
  }
});

store.commit("setUser");

export default store;
