export default {
  template: `
    <div class="container py-5">
      <h3 class="text-purple fw-bold mb-4 text-center">User Summary</h3>
      
      <div v-if="loading" class="text-center">
        <div class="spinner-border text-purple" role="status"></div>
      </div>
      
      <div v-else>
        <div class="row mb-4 text-center">
          <div class="col-md-3">
            <div class="card p-3 shadow-sm">
              <h5>Total Attempts</h5>
              <h3>{{ summary.total_attempts }}</h3>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card p-3 shadow-sm">
              <h5>Average %</h5>
              <h3>{{ summary.average_percentage }}%</h3>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card p-3 shadow-sm">
              <h5>Passed</h5>
              <h3>{{ summary.total_passed }}</h3>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card p-3 shadow-sm">
              <h5>Failed</h5>
              <h3>{{ summary.total_failed }}</h3>
            </div>
          </div>
        </div>

        <h5 class="text-center mb-3">Recent Attempts</h5>
        <div class="table-responsive">
        <table class="table table-bordered shadow-sm">
          <thead class="table-light">
            <tr>
              <th>Quiz ID</th>
              <th>Subject</th>
              <th>Chapter</th>
              <th>Score</th>
              <th>Percentage</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="attempt in summary.attempts" :key="attempt.id">
              <td>{{ attempt.quiz_id }}</td>
              <td>{{ attempt.subject_name }}</td>
              <td>{{ attempt.chapter_name }}</td>
              <td>{{ attempt.score }}/{{ attempt.total }}</td>
              <td>{{ attempt.percentage }}%</td>
              <td>
                <span :class="attempt.percentage >= 33 ? 'text-success' : 'text-danger'">
                  {{ attempt.percentage >= 33 ? 'Pass' : 'Fail' }}
                </span>
              </td>
              <td>{{ new Date(attempt.date).toLocaleDateString() }}</td>
            </tr>
          </tbody>
        </table>
        <div class="table-responsive">
      </div>
    </div>
  `,
  data() {
    return {
      summary: null,
      loading: true
    }
  },
  methods: {
    async fetchSummary() {
      try {
        const userId = this.$route.params.id;
        const res = await fetch(`/api/admin/user/${userId}/summary`, {
          headers: {
            "Authentication-Token": this.$store.state.auth_token
          }
        });
        if (!res.ok) throw new Error("Failed to fetch summary");
        this.summary = await res.json();
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    }
  },
  created() {
    this.fetchSummary();
  }
}
