export default {
  name: 'UserFullSummary',
  template: `
    <div class="container mt-4 mb-5">
      <h2 class="text-center mb-4 fw-bold text-purple">Your Complete Performance Summary</h2>

      <div v-if="loading" class="text-center">
        <div class="spinner-border" role="status"></div>
        <p class="mt-2">Loading your data...</p>
      </div>

<div v-else>
  <div class="row mb-4 text-center">
    <div class="col-lg-4 col-md-6 col-sm-12 mb-4">
      <div class="p-3 border rounded shadow-sm bg-light h-100">
        <h5>Total Attempts</h5>
        <p class="fs-4 fw-bold">{{ totalAttempts }}</p>
      </div>
    </div>
    <div class="col-lg-4 col-md-6 col-sm-12 mb-4">
      <div class="p-3 border rounded shadow-sm bg-light h-100">
        <h5>Average Score</h5>
        <p class="fs-4 fw-bold">{{ averageScore }}%</p>
      </div>
    </div>
    <div class="col-lg-4 col-md-6 col-sm-12 mb-4">
      <div class="p-3 border rounded shadow-sm bg-light h-100">
        <h5>Pass Rate</h5>
        <p class="fs-4 fw-bold" :class="passRate >= 40 ? 'text-success' : 'text-danger'">{{ passRate }}%</p>
      </div>
    </div>
  </div>
</div>



        <div class="row mb-4">
          <div class="col-md-6 mb-4">
            <h5 class="text-center">Average Score per Subject</h5>
            <canvas id="avgScoreSubjectChart"></canvas>
          </div>
          <div class="col-md-6 mb-4">
            <h5 class="text-center">Pass Rate per Subject</h5>
            <canvas id="passRateSubjectChart"></canvas>
          </div>
        </div>

        <div class="row mb-4">
          <div class="col-md-6 mb-4">
            <h5 class="text-center">Scores Over Time</h5>
            <canvas id="scoreLineChart"></canvas>
          </div>
          <div class="col-md-6 mb-4">
            <h5 class="text-center">Score Distribution</h5>
            <canvas id="scoreBarChart"></canvas>
          </div>
        </div>

        <div class="row mb-4">
          <div class="col-md-6 mb-4">
            <div class="p-3 border rounded shadow-sm bg-light text-center">
              <h5>Top Subject</h5>
              <p class="fs-5 fw-bold">{{ topSubject.subject || 'N/A' }} ({{ topSubject.average_score || 0 }}%)</p>
            </div>
          </div>
          <div class="col-md-6 mb-4">
            <div class="p-3 border rounded shadow-sm bg-light text-center">
              <h5>Weakest Subject</h5>
              <p class="fs-5 fw-bold">{{ weakSubject.subject || 'N/A' }} ({{ weakSubject.average_score || 0 }}%)</p>
            </div>
          </div>
        </div>

        <div v-if="subjectsNeedImprovement.length" class="row mb-4">
          <div class="col">
            <div class="p-3 border rounded shadow-sm bg-light">
              <h5 class="text-center">Subjects You Need to Improve</h5>
              <ul class="list-group list-group-flush">
                <li v-for="subj in subjectsNeedImprovement" :key="subj.subject" class="list-group-item">
                  {{ subj.subject }} (Avg: {{ subj.average_score }}%)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      loading: true,
      totalAttempts: 0,
      averageScore: 0,
      passRate: 0,
      avgScorePerSubject: [],
      passRatePerSubject: [],
      scoresOverTime: [],
      scoreDistribution: [],
      topSubject: {},
      weakSubject: {},
      subjectsNeedImprovement: []
    };
  },
  mounted() {
    this.fetchSummary();
  },
  methods: {
    async fetchSummary() {
      try {
        const token = this.$store.state.auth_token || localStorage.getItem('token');
        const res = await fetch('/api/summary', {
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": token
          }
        });

        if (!res.ok) throw new Error('Unauthorized');
        const data = await res.json();

        this.totalAttempts = data.total_attempts || 0;
        this.averageScore = data.avg_score || 0;
        this.passRate = data.pass_rate || 0;
        this.avgScorePerSubject = data.avg_score_per_subject || [];
        this.passRatePerSubject = data.pass_rate_per_subject || [];
        this.scoresOverTime = data.scores_over_time || [];
        this.scoreDistribution = data.score_distribution || [];
        this.topSubject = data.top_subject || {};
        this.weakSubject = data.weak_subject || {};
        this.subjectsNeedImprovement = data.subjects_need_improvement || [];

        this.$nextTick(() => {
          setTimeout(() => {
            console.log("📊 Chart data debug:", {
              avgScorePerSubject: this.avgScorePerSubject,
              passRatePerSubject: this.passRatePerSubject,
              scoresOverTime: this.scoresOverTime,
              scoreDistribution: this.scoreDistribution
            });
            this.renderCharts();
          }, 200);
        });
      } catch (err) {
        console.error("❌ Failed to load summary:", err);
      } finally {
        this.loading = false;
      }
    },
    renderCharts() {
      const avgCanvas = document.getElementById('avgScoreSubjectChart');
      if (avgCanvas && this.avgScorePerSubject.length) {
        new Chart(avgCanvas, {
          type: 'bar',
          data: {
            labels: this.avgScorePerSubject.map(d => d.subject),
            datasets: [{
              label: 'Average Score (%)',
              data: this.avgScorePerSubject.map(d => d.average_score),
              backgroundColor: 'rgba(106, 17, 203, 0.6)',
              borderRadius: 8
            }]
          },
          options: { responsive: true }
        });
      }

      const passCanvas = document.getElementById('passRateSubjectChart');
      if (passCanvas && this.passRatePerSubject.length) {
        new Chart(passCanvas, {
          type: 'bar',
          data: {
            labels: this.passRatePerSubject.map(d => d.subject),
            datasets: [{
              label: 'Pass Rate (%)',
              data: this.passRatePerSubject.map(d => d.pass_rate),
              backgroundColor: 'rgba(17, 203, 106, 0.6)',
              borderRadius: 8
            }]
          },
          options: { responsive: true }
        });
      }

      const lineCanvas = document.getElementById('scoreLineChart');
      if (lineCanvas && this.scoresOverTime.length) {
        new Chart(lineCanvas, {
          type: 'line',
          data: {
            labels: this.scoresOverTime.map(s => s.date),
            datasets: [{
              label: 'Score %',
              data: this.scoresOverTime.map(s => s.score),
              borderColor: 'rgba(0,123,255,1)',
              backgroundColor: 'rgba(0,123,255,0.2)',
              tension: 0.3
            }]
          },
          options: { responsive: true }
        });
      }

      const barCanvas = document.getElementById('scoreBarChart');
      if (barCanvas && this.scoreDistribution.length) {
        new Chart(barCanvas, {
          type: 'bar',
          data: {
            labels: this.scoreDistribution.map(d => d.range),
            datasets: [{
              label: 'Attempts',
              data: this.scoreDistribution.map(d => d.count),
              backgroundColor: 'rgba(255, 159, 64, 0.6)',
              borderRadius: 8
            }]
          },
          options: { responsive: true }
        });
      }
    }
  }
}
