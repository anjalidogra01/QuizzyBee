export default {
  template: `
    <div class="container d-flex justify-content-center align-items-center vh-100">
      <div class="card p-4 shadow-lg border-purple" style="width: 450px;">
        <h2 class="text-center text-purple fw-bold">Quiz Master</h2>
        <h4 class="text-center text-warning">Register</h4>

        <!-- Success & Error Messages -->
        <div v-if="message" :class="['alert', messageClass, 'text-center']">
          {{ message }}
        </div>

        <form @submit.prevent="submitRegister" enctype="multipart/form-data">
          <div class="mb-2">
            <label class="form-label text-purple">Email:</label>
            <input type="email" class="form-control border-purple" v-model="email" required />
          </div>

          <div class="mb-2">
            <label class="form-label text-purple">Username:</label>
            <input type="text" class="form-control border-purple" v-model="username" required />
          </div>

          <div class="mb-2">
            <label class="form-label text-purple">Password:</label>
            <input type="password" class="form-control border-purple" v-model="password" required />
          </div>

          <div class="mb-2">
            <label class="form-label text-purple">Full Name:</label>
            <input type="text" class="form-control border-purple" v-model="fullname" required />
          </div>

          <div class="mb-2">
            <label class="form-label text-purple">Qualification:</label>
            <input type="text" class="form-control border-purple" v-model="qualification" />
          </div>

          <div class="mb-2">
            <label class="form-label text-purple">Date of Birth:</label>
            <input type="date" class="form-control border-purple" v-model="dob" />
          </div>

          <div class="mb-2">
            <label class="form-label text-purple">Upload Profile Image:</label>
            <input type="file" @change="handleImageUpload" accept="image/*" />
          </div>

          <button type="submit" class="btn btn-purple w-100">Register</button>
        </form>

        <div class="text-center mt-3">
          <router-link to="/login" class="text-purple fw-bold">Existing User? Login Here</router-link>
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
      role: "user",
      image: null,  // this stores the selected image file
      message: "",
      messageClass: "",
    };
  },
  methods: {
    handleImageUpload(event) {
      this.image = event.target.files[0];
    },

    async submitRegister() {
      if (!this.email || !this.username || !this.password || !this.fullname) {
        this.showMessage("Please fill in all required fields!", "alert-danger");
        return;
      }

      try {
        const formData = new FormData();
        formData.append("email", this.email);
        formData.append("username", this.username);
        formData.append("password", this.password);
        formData.append("fullname", this.fullname);
        formData.append("qualification", this.qualification);
        formData.append("dob", this.dob);
        formData.append("role", this.role);
        if (this.image) {
          formData.append("image", this.image);
        }

        const res = await fetch(location.origin + "/register", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (res.ok) {
          this.showMessage("Registration successful! Redirecting to login...", "alert-success");
          setTimeout(() => {
            this.$router.push('/login');
          }, 2000);
        } else {
          this.showMessage(data.message || "Registration failed!", "alert-danger");
        }
      } catch (error) {
        this.showMessage("An error occurred. Please try again.", "alert-danger");
      }
    },

    showMessage(msg, cls) {
      this.message = msg;
      this.messageClass = `alert ${cls}`;
    }
  }
};
