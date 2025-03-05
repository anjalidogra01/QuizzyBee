export default {
    template: `
    <div class="container d-flex justify-content-center align-items-center vh-100">
        <div class="card p-4 shadow" style="width: 450px;">
            <h2 class="text-center">Welcome to Quiz Master</h2>
            <h4 class="text-center text-warning">Registration</h4>

            <!-- Success & Error Messages -->
            <div v-if="message" :class="['alert', messageClass, 'text-center']">
                {{ message }}
            </div>

            <form @submit.prevent="submitRegister">
                <div class="mb-2 d-flex">
                    <label class="form-label w-50">Email:</label>
                    <input type="email" class="form-control w-50" v-model="email" required />
                </div>

                <div class="mb-2 d-flex">
                    <label class="form-label w-50">Username:</label>
                    <input type="text" class="form-control w-50" v-model="username" required />
                </div>

                <div class="mb-2 d-flex">
                    <label class="form-label w-50">Password:</label>
                    <input type="password" class="form-control w-50" v-model="password" required />
                </div>

                <div class="mb-2 d-flex">
                    <label class="form-label w-50">Full Name:</label>
                    <input type="text" class="form-control w-50" v-model="fullname" required />
                </div>

                <div class="mb-2 d-flex">
                    <label class="form-label w-50">Qualification:</label>
                    <input type="text" class="form-control w-50" v-model="qualification" />
                </div>

                <div class="mb-2 d-flex">
                    <label class="form-label w-50">Date of Birth:</label>
                    <input type="date" class="form-control w-50" v-model="dob" />
                </div>

                <div class="text-center">
                    <button type="submit" class="btn btn-primary w-100">Register</button>
                </div>
            </form>

            <div class="text-center mt-3">
                <router-link to='/login' class="text-danger">Existing User? Login Here</router-link>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            email: "",
            username: "",
            password: "",
            fullname: "",
            qualification: "",
            dob: "",
            role: "user",  // Hardcoded because Admin doesn't register
            message: "",
            messageClass: "",
        };
    },
    methods: {
        async submitRegister() {
            if (!this.email || !this.username || !this.password || !this.fullname) {
                this.message = "Please fill in all required fields!";
                this.messageClass = "alert alert-danger";
                return;
            }

            try {
                const res = await fetch(location.origin + "/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: this.email,
                        username: this.username,
                        password: this.password,
                        fullname: this.fullname,
                        qualification: this.qualification,
                        dob: this.dob,
                        role: this.role
                    }),
                });

                const data = await res.json();

                if (res.ok) {
                    this.message = "Registration successful! Redirecting to login...";
                    this.messageClass = "alert alert-success";
                    
                    setTimeout(() => {
                        this.$router.push('/login'); // Use Vue Router instead of window.location.href
                    }, 2000);
                } else {
                    this.message = data.message || "Registration failed!";
                    this.messageClass = "alert alert-danger";
                }
            } catch (error) {
                this.message = "An error occurred. Please try again.";
                this.messageClass = "alert alert-danger";
            }
        },
    }
};

