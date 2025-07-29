export default {
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card shadow-lg p-4 border-0 rounded-4 text-center">
            <h3 class="text-purple mb-4 fw-bold">Export Reports</h3>
            <p class="mb-4 text-muted">Download CSV report of users' quiz performances.</p>

            <button 
              :disabled="loading"
              @click="exportCSV"
              class="btn btn-purple btn-lg rounded-pill px-5 shadow-sm"
            >
              <span v-if="loading">
                <span class="spinner-border spinner-border-sm me-2"></span> Generating...
              </span>
              <span v-else>
                Export as CSV
              </span>
            </button>

            <div v-if="successMsg" class="alert alert-success mt-4">{{ successMsg }}</div>
            <div v-if="errorMsg" class="alert alert-danger mt-4">{{ errorMsg }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      loading: false,
      successMsg: "",
      errorMsg: ""
    }
  },
  methods: {
    async exportCSV() {
      this.loading = true;
      this.successMsg = "";
      this.errorMsg = "";
      try {
        const res = await fetch('/api/admin/export', {
          headers: {
            "Authentication-Token": this.$store.state.auth_token
          }
        });
        if (!res.ok) throw new Error("Export failed");
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'user_quiz_summary.csv');

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.successMsg = "CSV downloaded successfully.";
      } catch (err) {
        console.error(err);
        this.errorMsg = "Failed to export CSV. Try again.";
      } finally {
        this.loading = false;
      }
    }
  }
}
