export default {
  template: `
    <div class="container mt-4">
      <h2 class="mb-3 text-center">All Quizzes</h2>

      <div class="d-flex justify-content-between align-items-center mb-4">
        <input type="text" class="form-control w-50" v-model="searchQuery" placeholder="Search quizzes...">
        <button class="btn btn-primary mb-3" @click="openModal"> + Add Quiz</button>
      </div>

      <div class="row">
        <div v-if="filteredQuizzes.length > 0" class="w-100">
          <div class="row">
            <div class="col-lg-4 col-md-6 mb-4" v-for="quiz in filteredQuizzes" :key="quiz.id">
              <div class="card custom-card d-flex flex-column justify-content-between h-100 w-100">
                <div class="card-body flex-grow-1">
                  <h5 class="card-title fw-bold text-primary">{{ quiz.name || 'Untitled Quiz' }}</h5>
                  <p class="card-text">📅 Date: {{ quiz.date_of_quiz }}</p>
                  <p class="card-text">⏰ Start Time: {{ quiz.start_time || 'Not set' }}</p>
                  <p class="card-text">⏳ Duration: {{ quiz.time_duration }} minutes</p>
                  <p class="card-text">📝 Remarks: {{ quiz.remarks || 'No remarks' }}</p>
                </div>
                <div class="card-footer bg-white border-0 text-center">
                  <router-link 
                    :to="'/subject/' + subjectId + '/chapter/' + chapterId + '/quiz/' + quiz.id" 
                    class="btn btn-success mx-2">
                    Questions
                  </router-link>
                  <button class="btn btn-warning mx-2" @click="editQuiz(quiz)">Edit</button>
                  <button class="btn btn-danger mx-2" @click="deleteQuiz(quiz.id)">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="col-12">
          <p class="text-muted text-center">No quizzes found.</p>
        </div>
      </div>

      <!-- Modal -->
      <div class="modal fade" id="quizModal" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ isEdit ? 'Edit' : 'Add' }} Quiz</h5>
              <button type="button" class="close" @click="closeModal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label for="quizName">Quiz Name</label>
                <input type="text" class="form-control" id="quizName" v-model="quiz.name" required>
              </div>
              <div class="form-group">
                <label for="quizDate">Date</label>
                <input type="date" class="form-control" id="quizDate" v-model="quiz.date_of_quiz" required>
              </div>
              <div class="form-group">
                <label for="quizStartTime">Start Time</label>
                <input type="time" class="form-control" id="quizStartTime" v-model="quiz.start_time" required>
              </div>
              <div class="form-group">
                <label for="quizDuration">Duration (minutes)</label>
                <input type="number" min="1" class="form-control" id="quizDuration" v-model="quiz.time_duration" required>
              </div>
              <div class="form-group">
                <label for="quizRemarks">Remarks</label>
                <textarea class="form-control" id="quizRemarks" v-model="quiz.remarks"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">Close</button>
              <button type="button" class="btn btn-primary" @click="saveQuiz">{{ isEdit ? 'Update' : 'Save' }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      subjectId: null,
      chapterId: null,
      quizzes: [],
      searchQuery: "",
      quiz: {
        id: null,
        name: '',
        date_of_quiz: '',
        start_time: '',
        time_duration: '',
        remarks: ''
      },
      isEdit: false,
      chapterName: ""
    };
  },
  computed: {
    filteredQuizzes() {
      if (!this.searchQuery) return this.quizzes;
      const query = this.searchQuery.toLowerCase();
      return this.quizzes.filter((quiz) =>
        quiz.name?.toLowerCase().includes(query) ||
        quiz.date_of_quiz.includes(query) ||
        (quiz.remarks && quiz.remarks.toLowerCase().includes(query))
      );
    }
  },
  watch: {
    '$route'(to) {
      if (to.params.subject_id && to.params.chapter_id) {
        this.subjectId = to.params.subject_id;
        this.chapterId = to.params.chapter_id;
        this.fetchQuizzes();
      }
    }
  },
  created() {
    this.subjectId = this.$route.params.subject_id;
    this.chapterId = this.$route.params.chapter_id;
    if (this.subjectId && this.chapterId) {
      this.fetchQuizzes();
    }
  },
  methods: {
    fetchQuizzes: async function () {
      if (!this.subjectId || !this.chapterId) return;
      const token = this.$store.state.auth_token;

      try {
        const res = await fetch(`${location.origin}/api/subjects/${this.subjectId}/chapters/${this.chapterId}/quizzes`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": token
          }
        });

        if (!res.ok) return;

        this.quizzes = await res.json();
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    },
    openModal: function () {
      this.isEdit = false;
      this.quiz = {
        id: null,
        name: '',
        date_of_quiz: '',
        start_time: '',
        time_duration: '',
        remarks: ''
      };
      $('#quizModal').modal('show');
    },
    closeModal: function () {
      $('#quizModal').modal('hide');
    },
    saveQuiz: async function () {
      if (!this.quiz.name || !this.quiz.date_of_quiz || !this.quiz.time_duration || !this.quiz.start_time) {
        alert("All fields are required.");
        return;
      }

      const token = this.$store.state.auth_token;
      const url = this.isEdit
        ? `${location.origin}/api/subjects/${this.subjectId}/chapters/${this.chapterId}/quizzes/${this.quiz.id}`
        : `${location.origin}/api/subjects/${this.subjectId}/chapters/${this.chapterId}/quizzes`;

      const method = this.isEdit ? "PUT" : "POST";

      try {
        const res = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": token
          },
          body: JSON.stringify(this.quiz)
        });

        if (!res.ok) return;

        this.fetchQuizzes();
        this.closeModal();
      } catch (error) {
        console.error("Error saving quiz:", error);
      }
    },
    editQuiz: function (quiz) {
      this.isEdit = true;

      const formattedTime = quiz.start_time && quiz.start_time.length === 5
        ? quiz.start_time
        : quiz.start_time?.slice(0, 5) || '';

      this.quiz = {
        id: quiz.id,
        name: quiz.name || '',
        date_of_quiz: quiz.date_of_quiz,
        start_time: formattedTime,
        time_duration: quiz.time_duration,
        remarks: quiz.remarks
      };
      $('#quizModal').modal('show');
    },
    deleteQuiz: async function (quizId) {
      if (!confirm("Are you sure you want to delete this quiz?")) return;

      const token = this.$store.state.auth_token;
      try {
        const res = await fetch(`${location.origin}/api/subjects/${this.subjectId}/chapters/${this.chapterId}/quizzes/${quizId}`, {
          method: "DELETE",
          headers: { "Authentication-Token": token }
        });

        if (!res.ok) return;

        this.fetchQuizzes();
      } catch (error) {
        console.error("Error deleting quiz:", error);
      }
    }
  }
};
