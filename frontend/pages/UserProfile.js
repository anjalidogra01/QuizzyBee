export default {
  template: `
<div class="container py-5">
  <div class="row justify-content-center">
    <div class="col-lg-8">
      <div class="custom-card shadow-lg p-4 border-0 rounded-4">
        <div class="text-center mb-4">
          <div v-if="user.image" class="text-center mb-4">
<img 
  :src="'/uploads/profile_pics/' + user.image"
  alt="Profile Picture"
  style="width: 150px; height: 150px; object-fit: cover; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"
/>

</div>

          <div v-if="editing" class="mt-3">
            <input type="file" @change="handleImageUpload" class="form-control w-50 mx-auto">
          </div>
        </div>

        <h3 class="text-center text-purple mb-4 fw-bold">My Profile</h3>

        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-purple" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else>
          <div class="mb-3">
            <label class="form-label fw-semibold">Username</label>
            <p class="form-control-plaintext border-bottom pb-1">{{ user.username }}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Email</label>
            <p class="form-control-plaintext border-bottom pb-1">{{ user.email }}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Full Name</label>
            <input v-if="editing" v-model="formData.fullname" class="form-control border-purple shadow-sm">
            <p v-else class="form-control-plaintext border-bottom pb-1">{{ user.fullname || 'Not specified' }}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Qualification</label>
            <input v-if="editing" v-model="formData.qualification" class="form-control border-purple shadow-sm">
            <p v-else class="form-control-plaintext border-bottom pb-1">{{ user.qualification || 'Not specified' }}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Date of Birth</label>
            <input v-if="editing" v-model="formData.dob" type="date" class="form-control border-purple shadow-sm">
            <p v-else class="form-control-plaintext border-bottom pb-1">{{ user.dob ? new Date(user.dob).toLocaleDateString() : 'Not specified' }}</p>
          </div>

          <div class="d-flex justify-content-center mt-4 flex-wrap gap-3">
            <button v-if="!editing" @click="startEditing" class="btn btn-outline-purple px-4 py-2 shadow-sm">Edit Profile</button>
            <button v-if="editing" @click="saveProfile" class="btn btn-purple px-4 py-2 shadow-sm">Save Changes</button>
            <button v-if="editing" @click="cancelEditing" class="btn btn-secondary px-4 py-2 shadow-sm">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
`
,
  data() {
    return {
      loading: true,
      editing: false,
      user: {},
      formData: {}
    }
  },
  methods: {
    async fetchUserProfile() {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const token = storedUser ? storedUser.token : null;

        const response = await fetch('/api/user/profile', {
          headers: {
            'Authentication-Token': token
          }
        });

        if (response.status === 401) {
          this.handleUnauthorized();
          return;
        }

        const userData = await response.json();
        this.user = userData;
        this.formData = {
          fullname: userData.fullname || '',
          qualification: userData.qualification || '',
          dob: userData.dob ? userData.dob.slice(0, 10) : '', // Format: YYYY-MM-DD
        };
        this.loading = false;
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    },

    async saveProfile() {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const token = storedUser ? storedUser.token : null;

        const formData = new FormData();
        formData.append('fullname', this.formData.fullname || '');
        formData.append('qualification', this.formData.qualification || '');
        formData.append('dob', this.formData.dob || '');

        if (this.formData.imageFile) {
          formData.append('image', this.formData.imageFile);
        }

        const response = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: {
            'Authentication-Token': token
            // ⚠️ Don't set Content-Type manually
          },
          body: formData
        });

        if (response.ok) {
          await this.fetchUserProfile();
          this.editing = false;
        } else if (response.status === 401) {
          this.handleUnauthorized();
        } else {
          console.error("Update failed:", await response.text());
        }
      } catch (error) {
        console.error("Error saving profile:", error);
      }
    },

    startEditing() {
      this.editing = true;
    },

    cancelEditing() {
      this.editing = false;
    },

    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.formData.imageFile = file;
      }
    },

    handleUnauthorized() {
      localStorage.removeItem("user");
      this.$router.push('/login');
    }
  },
  created() {
    this.fetchUserProfile();
  }
};
