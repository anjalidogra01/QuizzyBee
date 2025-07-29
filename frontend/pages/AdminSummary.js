export default {
  name: 'AdminSummary',
  template: `
    <div class="container mt-4 mb-5">
      <h2 class="text-center mb-4 fw-bold text-purple">Admin Summary Dashboard</h2>

      <!-- Overall Stats -->
<div class="row text-center mb-5">
  <div class="col-lg-4 col-md-6 col-sm-12 mb-4">
    <div class="p-3 border rounded shadow-sm bg-light">
      <h5>Total Quizzes</h5>
      <p class="fs-4 fw-bold">{{ totalQuizzes }}</p>
    </div>
  </div>
  <div class="col-lg-4 col-md-6 col-sm-12 mb-4">
    <div class="p-3 border rounded shadow-sm bg-light">
      <h5>Upcoming Quizzes</h5>
      <p class="fs-4 fw-bold">{{ upcomingQuizzes }}</p>
    </div>
  </div>
  <div class="col-lg-4 col-md-6 col-sm-12 mb-4">
    <div class="p-3 border rounded shadow-sm bg-light">
      <h5>Avg. Duration</h5>
      <p class="fs-4 fw-bold">{{ averageDuration }} mins</p>
    </div>
  </div>
</div>

      <!-- Chart Grid -->
      <div class="row mb-4">
        <div class="col-md-6 mb-4">
          <h5 class="text-center">Quiz Count Per Subject</h5>
          <div style="height:300px">
            <canvas id="subjectChart"></canvas>
          </div>
        </div>
        <div class="col-md-6 mb-4">
          <h5 class="text-center">Pass vs Fail Stats</h5>
          <div style="height:300px">
            <canvas id="passFailChart"></canvas>
          </div>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-md-6 mb-4">
          <h5 class="text-center">Top 5 Scoring Users</h5>
          <div style="height:300px">
            <canvas id="topUsersChart"></canvas>
          </div>
        </div>
        <div class="col-md-6 mb-4">
          <h5 class="text-center">Quiz Attempts Over Time</h5>
          <div style="height:300px">
            <canvas id="attemptTrendChart"></canvas>
          </div>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-md-6 mb-4">
          <h5 class="text-center">Average Score Per Subject</h5>
          <div style="height:300px">
            <canvas id="avgScoreChart"></canvas>
          </div>
        </div>
        <div class="col-md-6 mb-4">
          <h5 class="text-center">Pass Rate Per Subject</h5>
          <div style="height:300px">
            <canvas id="passRateChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Recent Quizzes Table -->
      <div class="mt-4">
        <h5 class="text-center mb-3">Recent Quizzes</h5>
        <table class="table table-bordered">
          <thead class="table-light">
            <tr>
              <th>Date</th>
              <th>Subject</th>
              <th>Chapter</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="quiz in recentQuizzes" :key="quiz.date">
              <td>{{ quiz.date }}</td>
              <td>{{ quiz.subject }}</td>
              <td>{{ quiz.chapter }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  data() {
    return {
      loading: true,
      totalQuizzes: 0,
      upcomingQuizzes: 0,
      averageDuration: 0,
      recentQuizzes: [],
      topUsers: [],
      passFail: { pass: 0, fail: 0 },
      quizzesPerSubject: [],
      avgScorePerSubject: [],
      passRatePerSubject: [],
      attemptsOverTime: []
    };
  },
  mounted() {
    this.fetchSummary();
  },
  methods: {
    async fetchSummary() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/summary', {
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": token
          },
        });

        if (!res.ok) throw new Error('Unauthorized');

        const data = await res.json();
        this.totalQuizzes = data.total_quizzes;
        this.upcomingQuizzes = data.upcoming_quizzes;
        this.averageDuration = data.average_duration;
        this.recentQuizzes = data.recent_quizzes;
        this.topUsers = data.top_users;
        this.passFail = { pass: data.pass_count, fail: data.fail_count };
        this.quizzesPerSubject = data.quizzes_per_subject;
        this.avgScorePerSubject = data.avg_score_per_subject;
        this.passRatePerSubject = data.pass_rate_per_subject;
        this.attemptsOverTime = data.attempts_over_time;
        this.renderCharts();
      } catch (err) {
        console.error('Failed to load summary:', err);
      }
    },
    renderCharts() {
      if (!this.quizzesPerSubject || !this.topUsers || !this.passFail) return;

      new Chart(document.getElementById('subjectChart'), {
        type: 'bar',
        data: {
          labels: this.quizzesPerSubject.map(s => s.subject),
          datasets: [{
            label: 'Quizzes',
            data: this.quizzesPerSubject.map(s => s.count),
            backgroundColor: 'rgba(106, 17, 203, 0.6)',
            borderRadius: 8,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });

      new Chart(document.getElementById('passFailChart'), {
        type: 'pie',
        data: {
          labels: ['Pass', 'Fail'],
          datasets: [{
            data: [this.passFail.pass, this.passFail.fail],
            backgroundColor: ['#28a745', '#dc3545']
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });

      new Chart(document.getElementById('topUsersChart'), {
        type: 'bar',
        data: {
          labels: this.topUsers.map(u => u.username),
          datasets: [{
            label: 'Avg Score %',
            data: this.topUsers.map(u => u.avg_score),
            backgroundColor: 'rgba(255, 193, 7, 0.7)',
            borderRadius: 8,
          }],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false
        }
      });

      new Chart(document.getElementById('avgScoreChart'), {
        type: 'bar',
        data: {
          labels: this.avgScorePerSubject.map(s => s.subject),
          datasets: [{
            label: 'Avg Score %',
            data: this.avgScorePerSubject.map(s => s.average_score),
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderRadius: 8,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });

      new Chart(document.getElementById('passRateChart'), {
        type: 'bar',
        data: {
          labels: this.passRatePerSubject.map(s => s.subject),
          datasets: [{
            label: 'Pass Rate %',
            data: this.passRatePerSubject.map(s => s.pass_rate),
            backgroundColor: 'rgba(40, 167, 69, 0.6)',
            borderRadius: 8,
          }],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false
        }
      });

      new Chart(document.getElementById('attemptTrendChart'), {
        type: 'line',
        data: {
          labels: this.attemptsOverTime.map(x => x.date),
          datasets: [{
            label: 'Attempts',
            data: this.attemptsOverTime.map(x => x.count),
            borderColor: 'rgba(153, 102, 255, 1)',
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    },
  }
};
