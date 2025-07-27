export default {
  template: `
    <div class="container d-flex justify-content-center align-items-center vh-100">
      <div class="card p-4 custom-card shadow-lg" style="width: 400px;">
        <h2 class="text-center text-purple fw-bold">Login</h2>

        <div v-if="message" :class="messageClass" class="alert text-center">
          {{ message }}
        </div>

        <form @submit.prevent="submitLogin">
          <div class="mb-3">
            <label class="form-label text-purple">Email:</label>
            <input type="email" class="form-control border-purple" v-model="email" required />
          </div>

          <div class="mb-3">
            <label class="form-label text-purple">Password:</label>
            <input type="password" class="form-control border-purple" v-model="password" required />
          </div>

          <button type="submit" class="btn btn-purple w-100">Login</button>
        </form>

        <p class="text-center mt-3">
          Don't have an account?
          <router-link to="/register" class="text-purple fw-bold">Sign Up</router-link>
        </p>
      </div>
    </div>
  `,
  data() {
    return {
      email: "",
      password: "",
      message: null,
      messageClass: null
    };
  },
  methods: {
    async submitLogin() {
      if (!this.email || !this.password) {
        this.showMessage("Please enter both email and password.", "alert-danger");
        return;
      }

      console.log("Login email:", this.email);
      console.log("Login password:", this.password);

      try {
        const res = await fetch("http://127.0.0.1:5000/custom-login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password
          })
        });

        const data = await res.json();

        if (res.ok) {
          this.showMessage("Login successful! Redirecting...", "alert-success");

          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data));
          this.$store.commit("setUser");

          setTimeout(() => {
            this.$router.push(data.role === "admin" ? "/admin-dashboard" : "/user-dashboard");
          }, 1500);
        } else {
          this.showMessage(data.message || "Login failed!", "alert-danger");
        }
      } catch (error) {
        console.error("Login error:", error);
        this.showMessage("An error occurred. Please try again.", "alert-danger");
      }
    },
    showMessage(msg, cls) {
      this.message = msg;
      this.messageClass = `alert ${cls}`;
    }
  }
};
