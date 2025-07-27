export default {
  name: "UserScore",
  template: `
    <div class="container mt-5">
      <div class="row">
        <!-- Sidebar Filters -->
        <div class="col-md-3">
          <div class="card p-5 shadow-sm mb-4">
            <h5 class="fw-bold mb-3 text-purple">Filter Results</h5>

            <div class="mb-3">
              <label class="form-label fw-semibold">Result Status</label>
              <div>
                <input type="radio" v-model="resultFilter" value="" class="form-check-input me-1" /> All <br/>
                <input type="radio" v-model="resultFilter" value="Passed" class="form-check-input me-1" /> Passed <br/>
                <input type="radio" v-model="resultFilter" value="Failed" class="form-check-input me-1" /> Failed
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold">Subject</label>
              <input v-model="subjectFilter" type="text" class="form-control" placeholder="Search subject" />
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold">Chapter</label>
              <input v-model="chapterFilter" type="text" class="form-control" placeholder="Search chapter" />
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold">Quiz ID</label>
              <input v-model.number="quizIdFilter" type="number" class="form-control" placeholder="Quiz ID" />
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold">% Range</label>
              <div class="input-group">
                <input v-model.number="minPercentage" type="number" class="form-control" placeholder="Min %" />
                <input v-model.number="maxPercentage" type="number" class="form-control" placeholder="Max %" />
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold">Date Range</label>
              <input v-model="dateFrom" type="date" class="form-control mb-2" />
              <input v-model="dateTo" type="date" class="form-control" />
            </div>

            <button @click="clearFilters" class="btn btn-secondary w-100 mt-3">Clear Filters</button>
          </div>
        </div>

        <!-- Table -->
        <div class="col-md-9">
          <div v-if="loading" class="text-center">
            <div class="spinner-border" role="status"></div>
            <p class="mt-2">Loading your attempts...</p>
          </div>

          <div v-else>
            <table class="table table-bordered table-striped shadow-sm" v-if="filteredAttempts.length">
              <thead class="table-light">
                <tr>
                  <th>Subject</th>
                  <th>Chapter</th>
                  <th>Quiz ID</th>
                  <th>Date</th>
                  <th>Percentage</th>
                  <th>Result</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="attempt in filteredAttempts" :key="attempt.quiz_id + attempt.timestamp_of_attempt">
                  <td>{{ attempt.subject_name }}</td>
                  <td>{{ attempt.chapter_name }}</td>
                  <td>{{ attempt.quiz_id }}</td>
                  <td>{{ formatDate(attempt.timestamp_of_attempt) }}</td>
                  <td>{{ attempt.percentage }}%</td>
                  <td :class="{
                    'text-success': attempt.result_status === 'Passed',
                    'text-danger': attempt.result_status == 'Failed'
                  }">
                    {{ attempt.result_status }}
                  </td>
                  <td>{{ attempt.duration_taken }}</td>
                </tr>
              </tbody>
            </table>

            <p v-else class="text-center text-muted">No attempts found matching filters.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      loading: true,
      attempts: [],
      subjectFilter: "",
      chapterFilter: "",
      quizIdFilter: "",
      resultFilter: "",
      minPercentage: null,
      maxPercentage: null,
      dateFrom: "",
      dateTo: ""
    };
  },
  computed: {
    filteredAttempts() {
      return this.attempts.filter(attempt => {
        const subjectMatch = this.subjectFilter === "" || 
          (attempt.subject_name && attempt.subject_name.toLowerCase().includes(this.subjectFilter.toLowerCase()));
        
        const chapterMatch = this.chapterFilter === "" ||
          (attempt.chapter_name && attempt.chapter_name.toLowerCase().includes(this.chapterFilter.toLowerCase()));
        
        const quizIdMatch = this.quizIdFilter === "" || attempt.quiz_id === this.quizIdFilter;

        const resultMatch = this.resultFilter === "" || attempt.result_status === this.resultFilter;

        const minMatch = this.minPercentage == null || attempt.percentage >= this.minPercentage;
        const maxMatch = this.maxPercentage == null || attempt.percentage <= this.maxPercentage;

        const date = new Date(attempt.timestamp_of_attempt);
        const fromMatch = this.dateFrom === "" || date >= new Date(this.dateFrom);
        const toMatch = this.dateTo === "" || date <= new Date(this.dateTo);

        return subjectMatch && chapterMatch && quizIdMatch && resultMatch && minMatch && maxMatch && fromMatch && toMatch;
      });
    }
  },
  methods: {
    async fetchAttempts() {
      try {
        const res = await fetch('/api/scores', {
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": this.$store.state.auth_token
          }
        });

        if (!res.ok) throw new Error("Unauthorized or failed");

        const data = await res.json();
        console.log("Fetched Attempts:", data);
        this.attempts = data;
      } catch (err) {
        console.error("Failed to load attempts:", err);
      } finally {
        this.loading = false;
      }
    },
    formatDate(isoString) {
      const date = new Date(isoString);
      return date.toLocaleString(); 
    },
    clearFilters() {
      this.subjectFilter = "";
      this.chapterFilter = "";
      this.quizIdFilter = "";
      this.resultFilter = "";
      this.minPercentage = null;
      this.maxPercentage = null;
      this.dateFrom = "";
      this.dateTo = "";
    }
  },
  created() {
    this.fetchAttempts();
  }
}
