export default {
  template: `
    <div class="container py-5">
      <h3 class="text-purple fw-bold mb-4 text-center">All Users</h3>

      <div class="mb-4 text-center">
        <input 
          type="text" 
          class="form-control w-50 mx-auto rounded-pill shadow-sm" 
          placeholder="Search by username, name, or email..."
          v-model="searchQuery"
        >
      </div>

      <div v-if="loading" class="text-center">
        <div class="spinner-border text-purple" role="status"></div>
      </div>

      <div v-else>
      <div class="table-responsive">
        <table class="table table-bordered shadow-sm">
          <thead class="table-light">
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Qualification</th>
              <th>DOB</th>
              <th>Status</th>
              <th>Action</th>
              <th>Summary</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.fullname || '-' }}</td>
              <td>{{ user.email || '-' }}</td>
              <td>{{ user.qualification || '-' }}</td>
              <td>{{ user.dob ? new Date(user.dob).toLocaleDateString() : '-' }}</td>
              <td>
                <span :class="{'text-success': user.is_active, 'text-danger': !user.is_active}">
                  {{ user.is_active ? 'Active' : 'Blocked' }}
                </span>
              </td>
              <td>
                <button 
                  class="btn btn-sm"
                  :class="user.is_active ? 'btn-danger' : 'btn-success'"
                  @click="toggleUserStatus(user)"
                >
                  {{ user.is_active ? 'Block' : 'Unblock' }}
                </button>
              </td>
              <td>
                <button class="btn btn-sm btn-purple" @click="viewSummary(user.id)">
                  View Summary
                </button>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="9" class="text-center text-muted">No users found.</td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      users: [],
      loading: true,
      searchQuery: ""
    }
  },
  computed: {
    filteredUsers() {
      const query = this.searchQuery.trim().toLowerCase();
      if (!query) return this.users;
      return this.users.filter(user =>
        (user.username && user.username.toLowerCase().includes(query)) ||
        (user.fullname && user.fullname.toLowerCase().includes(query)) ||
        (user.email && user.email.toLowerCase().includes(query))
      );
    }
  },
  methods: {
    async fetchUsers() {
      try {
        const res = await fetch('/api/admin/users', {
          headers: {
            "Authentication-Token": this.$store.state.auth_token
          }
        });
        if (!res.ok) throw new Error("Failed to fetch users");
        this.users = await res.json();
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    async toggleUserStatus(user) {
      try {
        const res = await fetch(`/api/admin/users/${user.id}/toggle`, {
          method: 'PUT',
          headers: {
            "Authentication-Token": this.$store.state.auth_token
          }
        });
        if (!res.ok) throw new Error("Failed to update user status");
        const updated = await res.json();
        user.is_active = updated.is_active;
      } catch (err) {
        console.error(err);
      }
    },
    viewSummary(userId) {
      this.$router.push(`/admin-user-summary/${userId}`);
    }
  },
  created() {
    this.fetchUsers();
  }
}
