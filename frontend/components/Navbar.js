const Navbar = {
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div class="container">
        <router-link to="/" class="navbar-brand fw-bold text-purple">QuizzyBee</router-link>
        <button class="navbar-toggler" type="button" @click="toggleNavbar">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" :class="{ show: isNavOpen }" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li v-if="roles.includes('admin')" class="nav-item">
              <router-link to="/admin-dashboard" class="nav-link" :class="{ 'fw-bold text-dark': isActive('/admin-dashboard') }">Dashboard</router-link>
            </li>
            <li v-if="roles.includes('admin')" class="nav-item">
              <router-link to="/admin-summary" class="nav-link" :class="{ 'fw-bold text-dark': isActive('/admin-summary') }">Summary</router-link>
            </li>
            <li v-if="roles.includes('admin')" class="nav-item">
              <router-link to="/admin-users" class="nav-link" :class="{ 'fw-bold text-dark': isActive('/admin-users') }">All Users</router-link>
            </li>
            <li v-if="roles.includes('admin')" class="nav-item">
              <router-link to="/admin-export" class="nav-link" :class="{ 'fw-bold text-dark': isActive('/admin-export') }">Export Reports</router-link>
            </li>

            <li v-if="roles.includes('user')" class="nav-item">
              <router-link to="/user-dashboard" class="nav-link" :class="{ 'fw-bold text-dark': isActive('/user-dashboard') }">Home</router-link>
            </li>
            <li v-if="roles.includes('user')" class="nav-item">
              <router-link to="/user-summary" class="nav-link" :class="{ 'fw-bold text-dark': isActive('/user-summary') }">Summary</router-link>
            </li>
            <li v-if="roles.includes('user')" class="nav-item">
              <router-link to="/user-score" class="nav-link" :class="{ 'fw-bold text-dark': isActive('/user-score') }">Score</router-link>
            </li>
            <li v-if="roles.includes('user')" class="nav-item">
              <router-link to="/profile" class="nav-link" :class="{ 'fw-bold text-dark': isActive('/profile') }">Profile</router-link>
            </li>

            <li class="nav-item">
              <button @click="logout" class="btn btn-sm btn-outline-danger ms-2">Logout</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  data() {
    return {
      isNavOpen: false,
      roles: this.getRoles()
    };
  },
  methods: {
    getRoles() {
      const user = JSON.parse(localStorage.getItem("user"));
      return user ? [user.role] : [];
    },
    logout() {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      this.$router.push("/login");
    },
    isActive(path) {
      return this.$route.path === path;
    },
    toggleNavbar() {
      this.isNavOpen = !this.isNavOpen;
    }
  }
};

export default Navbar;
