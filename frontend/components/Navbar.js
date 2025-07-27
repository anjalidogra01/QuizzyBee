const Navbar = {
    template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div class="container">
            <router-link to="/" class="navbar-brand fw-bold text-purple">Quiz Master</router-link>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li v-if="roles.includes('admin')" class="nav-item">
                        <router-link to="/admin-dashboard" class="nav-link">Dashboard</router-link>
                    </li>
                    <li v-if="roles.includes('admin')" class="nav-item">
                        <router-link to="/admin-summary" class="nav-link">Summary</router-link>
                    </li>
                    <li v-if="roles.includes('admin')" class="nav-item">
                        <router-link to="/admin-users" class="nav-link">All Users</router-link>
                    </li>
                    <li v-if="roles.includes('admin')" class="nav-item">
                        <router-link to="/admin-export" class="nav-link">Export Reports</router-link>
                    </li>

                    <li v-if="roles.includes('user')" class="nav-item">
                        <router-link to="/user-dashboard" class="nav-link">Home</router-link>
                    </li>
                    <li v-if="roles.includes('user')" class="nav-item">
                        <router-link to="/user-summary" class="nav-link">Summary</router-link>
                    </li>
                    <li v-if="roles.includes('user')" class="nav-item">
                        <router-link to="/user-score" class="nav-link">Score</router-link>
                    </li>
                    <li v-if="roles.includes('user')" class="nav-item">
                        <router-link to="/profile" class="nav-link">Profile</router-link>
                    </li>
                       <li v-if="roles.includes('user')" class="nav-item">
                        <router-link to="/user-export" class="nav-link">Export Reports</router-link>
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
        }
    }
};

export default Navbar;
