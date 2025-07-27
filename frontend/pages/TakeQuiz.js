export default {
  name: 'TakeQuiz',
  template: `
    <div class="container mt-5 mb-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="fw-semibold text-purple mb-0">Take Quiz</h2>
        <button class="btn btn-outline-secondary" @click="goHome">
          <i class="bi bi-house"></i> Home
        </button>
      </div>

      <div v-if="loading" class="text-center">
        <div class="spinner-border" role="status"></div>
        <p class="mt-2">Loading quiz...</p>
      </div>

      <div v-else-if="quizNotAvailable" class="alert alert-danger text-center">
        Quiz is not yet available.<br>
        It will be available on <strong>{{ scheduledDate }}</strong> at <strong>{{ scheduledTime }}</strong>.
      </div>

      <div v-else-if="questions.length && currentQuestionIndex < questions.length && !submitted">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <span class="text-purple">Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}</span>
          <div class="timer-box text-center text-purple fw-bold">
            <div class="timer-label">Time Left</div>
            <div class="timer-value">{{ formattedTimeLeft }}</div>
          </div>
        </div>

        <div class="row g-4">
          <div class="col-md-8">
            <div class="p-4 custom-card width-large">
              <p class="fw-bold">{{ currentQuestion.statement }}</p>

              <div v-for="(option, index) in currentQuestion.options" :key="index" class="form-check mb-2">
                <input
                  class="form-check-input"
                  type="radio"
                  :id="'option' + index"
                  :name="'question' + currentQuestionIndex"
                  :value="option"
                  v-model="userAnswers[currentQuestionIndex]"
                />
                <label class="form-check-label" :for="'option' + index">{{ option }}</label>
              </div>

              <div class="d-flex justify-content-between mt-4">
                <button class="btn btn-outline-light" @click="prevQuestion" :disabled="currentQuestionIndex === 0">Previous</button>
                <div>
                  <button class="btn btn-warning me-2" @click="toggleReview(currentQuestionIndex)">
                    {{ markedForReview[currentQuestionIndex] ? 'Unmark Review' : 'Mark for Review' }}
                  </button>
                  <button class="btn btn-primary" @click="nextQuestion">
                    {{ currentQuestionIndex === questions.length - 1 ? 'Submit Quiz' : 'Next' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="custom-card col-md-4">
            <div class="p-3 rounded text-white">
              <h5 class="mb-4 text-center text-purple">Question Status</h5>
              <div class="d-flex flex-wrap gap-2 justify-content-center overflow-auto" style="max-height: 460px;">
                <button
                  v-for="(q, i) in questions"
                  :key="i"
                  @click="currentQuestionIndex = i"
                  :class="[
                    'btn fw-bold m-2',
                    markedForReview[i] ? 'btn-warning' : userAnswers[i] ? 'btn-success' : 'btn-secondary'
                  ]"
                  style="width: 44px; height: 44px;"
                  :title="'Q' + (i + 1) + ': ' + (markedForReview[i] ? 'Marked for Review' : userAnswers[i] ? 'Answered' : 'Not Answered')"
                >
                  {{ i + 1 }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="submitted && !showResult" class="text-center mt-5">
        <div class="alert alert-success">Quiz submitted successfully!</div>
        <button class="btn btn-success" @click="showResult = true">Show Result</button>
        <button class="btn btn-outline-secondary ms-2" @click="goHome">Go to Dashboard</button>
      </div>

      <div v-else-if="submitted && showResult" class="mt-4">
        <div class="alert alert-success text-center">
          <h4 class="mb-0 fw-bold">Quiz Submitted!</h4>
          <small>See your score and explanations below.</small>
        </div>

        <div class="custom-card p-4 mb-4 rounded">
          <h4 class="text-center mb-3">Score Summary</h4>
          <div class="mb-3">
            <div class="d-flex justify-content-between">
              <span>Total Questions: <strong>{{ questions.length }}</strong></span>
              <span>Correct: <strong>{{ score.correct }}</strong></span>
            </div>
            <div class="progress mt-2" style="height: 20px;">
              <div
                class="progress-bar"
                role="progressbar"
                :style="{ width: score.percentage + '%' }"
                :class="score.percentage >= 40 ? 'bg-success' : 'bg-danger'"
              >
                {{ score.percentage }}%
              </div>
            </div>
          </div>
          <div class="d-flex justify-content-between">
            <span>Status: 
              <span :class="score.percentage >= 40 ? 'badge bg-success' : 'badge bg-danger'">
                {{ score.status }}
              </span>
            </span>
            <span>Time Taken: <strong>{{ score.duration }}</strong></span>
          </div>
          <div class="text-center mt-4">
            <button class="btn btn-outline-secondary" @click="goHome">Go to Dashboard</button>
          </div>
        </div>

        <div v-for="(question, index) in questions" :key="index" class="mb-3">
          <div
            class="p-3 rounded"
            :class="isCorrect(question, index) ? 'border border-success bg-light' : 'border border-danger bg-light'"
          >
            <h6>Question {{ index + 1 }}:</h6>
            <p class="mb-1"><strong>{{ question.statement }}</strong></p>
            <p>
              Your Answer: 
              <span :class="getAnswerClass(question, index)">
                {{ userAnswers[index] || 'Not Answered' }}
              </span>
            </p>
            <p>Correct Answer: <strong>{{ question.options[parseInt(question.correct_option) - 1] }}</strong></p>
            <p v-if="isCorrect(question, index)" class="text-success">✔ Correct</p>
            <p v-else class="text-danger">✘ Incorrect</p>
            <p class="mt-2">
              <strong>Explanation:</strong> 
              {{ getExplanation(question, index) }}
            </p>
          </div>
        </div>
      </div>

      <div v-else class="text-center text-danger mt-5">
        <p>No questions found for this quiz.</p>
        <button class="btn btn-outline-secondary mt-3" @click="goHome">Back to Dashboard</button>
      </div>
    </div>
  `,
  data() {
    return {
      questions: [],
      userAnswers: [],
      markedForReview: [],
      currentQuestionIndex: 0,
      loading: true,
      submitted: false,
      showResult: false,
      quizDuration: 0,
      timeLeft: 0,
      timerInterval: null,
      score: {
        correct: 0,
        percentage: 0,
        status: '',
        duration: ''
      },
      startTime: null,
      quizNotAvailable: false,
      scheduledDate: '',
      scheduledTime: ''
    };
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentQuestionIndex];
    },
    formattedTimeLeft() {
      var minutes = Math.floor(this.timeLeft / 60).toString().padStart(2, '0');
      var seconds = (this.timeLeft % 60).toString().padStart(2, '0');
      return minutes + ':' + seconds;
    }
  },
  methods: {
    goHome() {
      this.$router.push('/user-dashboard');
    },
    async fetchQuizMetadata(subject_id, chapter_id, quiz_id, token) {
      try {
        const res = await fetch(location.origin + '/api/subjects/' + subject_id + '/chapters/' + chapter_id + '/quizzes/' + quiz_id, {
          headers: { 'Content-Type': 'application/json', 'Authentication-Token': token }
        });
        const data = await res.json();
        const quizStart = new Date(data.date_of_quiz + 'T' + data.start_time);
        const now = new Date();
        this.scheduledDate = data.date_of_quiz;
        this.scheduledTime = data.start_time;

        if (now < quizStart) {
          this.quizNotAvailable = true;
          this.loading = false;
          return false;
        }

        this.quizDuration = (data.time_duration || 5) * 60;
        this.timeLeft = this.quizDuration;
        return true;
      } catch (err) {
        console.error("Error fetching quiz metadata", err);
        this.quizNotAvailable = true;
        this.loading = false;
        return false;
      }
    },
    async fetchQuestions() {
      const token = this.$store.state.auth_token;
      const { subject_id, chapter_id, quiz_id } = this.$route.params;
      const allowed = await this.fetchQuizMetadata(subject_id, chapter_id, quiz_id, token);
      if (!allowed) return;

      try {
        const res = await fetch(location.origin + '/api/subjects/' + subject_id + '/chapters/' + chapter_id + '/quizzes/' + quiz_id + '/questions', {
          headers: { 'Content-Type': 'application/json', 'Authentication-Token': token }
        });
        const data = await res.json();
        this.questions = data;
        this.userAnswers = Array(data.length).fill(null);
        this.markedForReview = Array(data.length).fill(false);
        this.startTime = new Date();
        this.startTimer();
      } catch (err) {
        console.error("Error loading questions:", err);
      } finally {
        this.loading = false;
      }
    },
    async saveScore() {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) return;

      const { quiz_id } = this.$route.params;
      const totalSeconds = Math.floor((new Date() - this.startTime) / 1000);
      const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
      const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
      const s = (totalSeconds % 60).toString().padStart(2, '0');
      const durationTaken = h + ':' + m + ':' + s;

      try {
        await fetch(location.origin + '/api/scores/' + user.id + '/' + quiz_id, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.$store.state.auth_token
          },
          body: JSON.stringify({
            total_scored: this.score.correct,
            total_marks: this.questions.length,
            percentage: parseFloat(this.score.percentage),
            result_status: this.score.status,
            duration_taken: durationTaken
          })
        });
      } catch (err) {
        console.error("Failed to save score:", err);
      }
    },
    startTimer() {
      this.timerInterval = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
        } else {
          clearInterval(this.timerInterval);
          if (!this.submitted) this.submitQuiz();
        }
      }, 1000);
    },
    prevQuestion() {
      if (this.currentQuestionIndex > 0) this.currentQuestionIndex--;
    },
    nextQuestion() {
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++;
      } else {
        this.submitQuiz();
      }
    },
    toggleReview(index) {
      this.$set(this.markedForReview, index, !this.markedForReview[index]);
    },
    async submitQuiz() {
      clearInterval(this.timerInterval);
      this.calculateScore();
      await this.saveScore();
      this.submitted = true;
    },
    calculateScore() {
      var correct = 0;
      this.questions.forEach((q, i) => {
        if (this.userAnswers[i] === q.options[parseInt(q.correct_option) - 1]) correct++;
      });
      var percent = ((correct / this.questions.length) * 100).toFixed(2);
      var seconds = Math.floor((new Date() - this.startTime) / 1000);
      this.score = {
        correct: correct,
        percentage: percent,
        status: percent >= 40 ? 'Passed' : 'Failed',
        duration: Math.floor(seconds / 60) + ' min ' + (seconds % 60) + ' sec'
      };
    },
    getAnswerClass(q, i) {
      if (this.userAnswers[i] === null) return 'text-warning';
      if (this.userAnswers[i] === q.options[parseInt(q.correct_option) - 1]) return 'text-success';
      return 'text-danger';
    },
    isCorrect(q, i) {
      return this.userAnswers[i] === q.options[parseInt(q.correct_option) - 1];
    },
    getExplanation(q) {
      return q.explanation || "No explanation available.";
    }
  },
  created() {
    this.fetchQuestions();
  },
  beforeDestroy() {
    clearInterval(this.timerInterval);
  }
};
