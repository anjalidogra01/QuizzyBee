export default {
    template: `
    <div class="container mt-4">
      <h2 class="mb-3 text-center">{{ quizTitle || "Loading Quiz..." }}</h2>
  
      <div class="d-flex justify-content-between align-items-center mb-4">
        <input type="text" class="form-control w-50" v-model="searchQuery" placeholder="Search questions...">
        <button class="btn btn-primary mb-3" @click="openModal"> + Add Question</button>
      </div>
  
      <div class="row">
        <div v-if="filteredQuestions.length > 0" class="w-100">
          <div class="row">
            <div class="col-lg-4 col-md-6 mb-4" v-for="question in filteredQuestions" :key="question.id">
              <div class="card custom-card d-flex flex-column justify-content-between h-100 w-100">
                <div class="card-body flex-grow-1">
                  <h5 class="card-title">Question: {{ question.statement }}</h5>
                  <p class="card-text"><strong>Options:</strong> <br>
                    1. {{ question.option1 }} <br>
                    2. {{ question.option2 }} <br>
                    3. {{ question.option3 }} <br>
                    4. {{ question.option4 }}
                  </p>
                  <p class="card-text"><strong>Correct Option:</strong> {{ question.correct_option }}</p>
                  <p class="card-text"><strong>Explanation:</strong> {{ question.explanation || '-' }}</p>
                </div>
                <div class="card-footer bg-white border-0 text-center">
                  <button class="btn btn-warning mx-2" @click="editQuestion(question)">Edit</button>
                  <button class="btn btn-danger mx-2" @click="deleteQuestion(question.id)">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="col-12">
          <p class="text-muted text-center">No questions found.</p>
        </div>
      </div>
  
      <div class="modal fade" id="questionModal" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ isEdit ? 'Edit' : 'Add' }} Question</h5>
              <button type="button" class="close" @click="closeModal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label>Question Statement</label>
                <textarea class="form-control" v-model="question.statement" required></textarea>
              </div>
              <div class="form-group">
                <label>Option 1</label>
                <input type="text" class="form-control" v-model="question.option1" required>
              </div>
              <div class="form-group">
                <label>Option 2</label>
                <input type="text" class="form-control" v-model="question.option2" required>
              </div>
              <div class="form-group">
                <label>Option 3</label>
                <input type="text" class="form-control" v-model="question.option3">
              </div>
              <div class="form-group">
                <label>Option 4</label>
                <input type="text" class="form-control" v-model="question.option4">
              </div>
              <div class="form-group">
                <label>Correct Option (1, 2, 3 or 4)</label>
                <input type="number" min="1" max="4" class="form-control" v-model="question.correct_option" required>
              </div>
              <div class="form-group">
                <label>Explanation</label>
                <textarea class="form-control" v-model="question.explanation"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">Close</button>
              <button type="button" class="btn btn-primary" @click="saveQuestion">{{ isEdit ? 'Update' : 'Save' }}</button>
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
      quizId: null,
      quizTitle: "",
      questions: [],
      searchQuery: "",
      question: {
        id: null,
        statement: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correct_option: '',
        explanation: ''
      },
      isEdit: false
    };
  },

  computed: {
    filteredQuestions() {
      if (!this.searchQuery) return this.questions;
      var query = this.searchQuery.toLowerCase();
      return this.questions.filter(q => q.statement.toLowerCase().includes(query));
    }
  },

  watch: {
    '$route': 'initializeData'
  },

  created() {
    this.initializeData();
  },

  methods: {
    initializeData() {
      this.subjectId = this.$route.params.subject_id;
      this.chapterId = this.$route.params.chapter_id;
      this.quizId = this.$route.params.quiz_id;
      if (this.subjectId && this.chapterId && this.quizId) {
        this.fetchQuestions();
        this.fetchQuizDetails();
      }
    },

    async fetchQuestions() {
      const token = this.$store.state.auth_token;
      try {
        const res = await fetch(`${location.origin}/api/subjects/${this.subjectId}/chapters/${this.chapterId}/quizzes/${this.quizId}/questions`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": token
          }
        });

        if (!res.ok) return;

        const rawQuestions = await res.json();

        // Map options array to option1 - option4
        this.questions = rawQuestions.map(q => {
          return {
            ...q,
            option1: q.options[0] || '',
            option2: q.options[1] || '',
            option3: q.options[2] || '',
            option4: q.options[3] || ''
          };
        });

      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    },

    async fetchQuizDetails() {
      const token = this.$store.state.auth_token;
      try {
        const res = await fetch(`${location.origin}/api/subjects/${this.subjectId}/chapters/${this.chapterId}/quizzes/${this.quizId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": token
          }
        });
        if (!res.ok) return;
        const data = await res.json();
        this.quizTitle = "Quiz on " + (data.date_of_quiz || "Unknown Date");
      } catch (error) {
        console.error("Error fetching quiz details:", error);
      }
    },

    openModal() {
      this.isEdit = false;
      this.question = {
        id: null,
        statement: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correct_option: '',
        explanation: ''
      };
      $('#questionModal').modal('show');
    },

    closeModal() {
      $('#questionModal').modal('hide');
    },

    async saveQuestion() {
      if (!this.question.statement || !this.question.option1 || !this.question.option2 || !this.question.correct_option) {
        alert("Please fill required fields (statement, option1, option2, correct_option).");
        return;
      }

      const token = this.$store.state.auth_token;
      const url = this.isEdit
        ? `${location.origin}/api/subjects/${this.subjectId}/chapters/${this.chapterId}/quizzes/${this.quizId}/questions/${this.question.id}`
        : `${location.origin}/api/subjects/${this.subjectId}/chapters/${this.chapterId}/quizzes/${this.quizId}/questions`;
      const method = this.isEdit ? "PUT" : "POST";

      try {
        const res = await fetch(url, {
          method: method,
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": token
          },
          body: JSON.stringify({
            statement: this.question.statement,
            option1: this.question.option1,
            option2: this.question.option2,
            option3: this.question.option3,
            option4: this.question.option4,
            correct_option: parseInt(this.question.correct_option),
            explanation: this.question.explanation
          })
        });

        if (!res.ok) return;
        this.fetchQuestions();
        this.closeModal();
      } catch (error) {
        console.error("Error saving question:", error);
      }
    },

    editQuestion(q) {
      this.isEdit = true;
      this.question = {
        id: q.id,
        statement: q.statement,
        option1: q.option1,
        option2: q.option2,
        option3: q.option3,
        option4: q.option4,
        correct_option: q.correct_option,
        explanation: q.explanation
      };
      $('#questionModal').modal('show');
    },

    async deleteQuestion(questionId) {
      if (!confirm("Are you sure you want to delete this question?")) return;
      const token = this.$store.state.auth_token;
      try {
        const res = await fetch(`${location.origin}/api/subjects/${this.subjectId}/chapters/${this.chapterId}/quizzes/${this.quizId}/questions/${questionId}`, {
          method: "DELETE",
          headers: { "Authentication-Token": token }
        });
        if (!res.ok) return;
        this.fetchQuestions();
      } catch (error) {
        console.error("Error deleting question:", error);
      }
    }
  }
  };
  