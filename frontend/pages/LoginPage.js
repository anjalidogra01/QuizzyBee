export default {
    template: `
    <div class="container d-flex justify-content-center align-items-center vh-100">
        <div class="card p-4 shadow" style="width: 400px;">
            <h2 class="text-center">Login</h2>

            <!-- Success & Error Messages -->
            <div v-if="message" :class="messageClass" class="alert text-center">
                {{ message }}
            </div>

            <form @submit.prevent="submitLogin">
                <div class="mb-3">
                    <label class="form-label">Email:</label>
                    <input type="email" class="form-control" v-model="email" required />
                </div>

                <div class="mb-3">
                    <label class="form-label">Password:</label>
                    <input type="password" class="form-control" v-model="password" required />
                </div>

                <div class="text-center">
                    <button type="submit" class="btn btn-primary w-100">Login</button>
                </div>
            </form>
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
                this.message = "Please enter both email and password.";
                this.messageClass = "alert alert-danger";
                return;
            }

            try {
                const res = await fetch(location.origin + "/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: this.email,
                        password: this.password
                    })
                });

                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem("user", JSON.stringify(data)); // Store user details

                    this.message = "Login successful! Redirecting...";
                    this.messageClass = "alert alert-success";

                    setTimeout(() => {
                        if (data.role === "admin") {
                            this.$router.push("/admin-dashboard");  // Redirect Admin
                        } else {
                            this.$router.push("/user-dashboard");  // Redirect User
                        }
                    }, 2000);
                } else {
                    this.message = data.message || "Login failed!";
                    this.messageClass = "alert alert-danger";
                }
            } catch (error) {
                this.message = "An error occurred. Please try again.";
                this.messageClass = "alert alert-danger";
            }
        }
    }
};
