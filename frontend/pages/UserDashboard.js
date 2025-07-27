export default {
  template: `
<div class="container py-4">
    <!-- Search Input -->
    <div class="row justify-content-center mb-4">
        <div class="col-md-8">
            <input 
                v-model="searchQuery"
                type="text"
                placeholder="Search subjects..."
                class="form-control form-control-lg rounded-pill shadow-sm"
            />
        </div>
    </div>

    <!-- Subject Cards -->
    <div v-if="filteredSubjects.length > 0" class="row">
        <div class="col-md-6 mb-4" v-for="subject in filteredSubjects" :key="subject.id">
            <div class="card border-0 shadow-sm h-100">
             <!-- Subject Image -->
            <img 
                v-if="subject.image"
                :src="subject.image" 
                alt="Subject Image" 
                class="card-img-top"
                style="height: 200px; object-fit: cover; border-top-left-radius: 0.5rem; border-top-right-radius: 0.5rem;"
            >
                <div class="card-body">
                    <h4 class="card-title text-center text-purple">{{ subject.name }}</h4>
                    <div class="d-grid my-3">
                        <button class="btn btn-outline-primary rounded-pill" @click="toggleSubject(subject.id)">
                            {{ isSubjectExpanded(subject.id) ? 'Hide Chapters' : 'View Chapters' }}
                        </button>
                    </div>

                    <!-- Chapters -->
                    <div v-if="isSubjectExpanded(subject.id)">
                        <div v-if="subject.chapters.length > 0">
                            <div v-for="chapter in subject.chapters" :key="chapter.id" class="mb-3 px-2 py-2 bg-light rounded shadow-sm">
                                <div class="d-flex justify-content-between align-items-center">
                                    <h5 class="mb-2">{{ chapter.name }}</h5>
                                    <button class="btn btn-sm btn-outline-secondary" @click="toggleChapter(chapter.id)">
                                        {{ isChapterExpanded(chapter.id) ? 'Hide Quizzes' : 'View Quizzes' }}
                                    </button>
                                </div>

                                <!-- Quizzes -->
                                <div v-if="isChapterExpanded(chapter.id)">
                                    <ul class="list-group mt-2">
                                        <li 
                                            v-for="quiz in chapter.quizzes"
                                            :key="quiz.id"
                                            class="list-group-item d-flex justify-content-between align-items-center"
                                        >
                                            <span>Quiz on {{ quiz.date_of_quiz }}</span>
                                            <router-link 
                                                :to="'/take-quiz/' + subject.id + '/' + chapter.id + '/' + quiz.id"
                                                class="btn btn-success btn-sm"
                                            >
                                                Start Quiz
                                            </router-link>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div v-else class="text-muted text-center">No chapters found.</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- No Subjects -->
    <div v-else class="text-center mt-5">
        <p class="text-muted">No subjects found.</p>
    </div>
</div>
`,
  data() {
    return {
      subjects: [],
      expandedSubjects: [],
      expandedChapters: [],
      searchQuery: "",
    };
  },
  computed: {
    filteredSubjects() {
      if (!this.searchQuery.trim()) return this.subjects;
      return this.subjects.filter(subject =>
        subject.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  },
  created() {
    this.fetchSubjects();
  },
  methods: {
    async fetchSubjects() {
      const token = this.$store.state.auth_token;
      console.log("Token from Vuex store:", token);

      try {
        const res = await fetch(`${location.origin}/api/subjects`, {
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": token
          }
        });
        if (!res.ok) {
          console.error("Failed to fetch subjects");
          return;
        }
        const subjects = await res.json();
        console.log("Fetched Subjects:", subjects);

        for (let subject of subjects) {
          const chaptersRes = await fetch(`${location.origin}/api/subjects/${subject.id}/chapters`, {
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": token
            }
          });
          if (chaptersRes.ok) {
            const chapters = await chaptersRes.json();
            console.log(`Chapters for Subject ${subject.id}:`, chapters);

            for (let chapter of chapters) {
              const quizzesRes = await fetch(`${location.origin}/api/subjects/${subject.id}/chapters/${chapter.id}/quizzes`, {
                headers: {
                  "Content-Type": "application/json",
                  "Authentication-Token": token
                }
              });
              if (quizzesRes.ok) {
                chapter.quizzes = await quizzesRes.json();
                console.log(`Quizzes for Chapter ${chapter.id}:`, chapter.quizzes);
              } else {
                chapter.quizzes = [];
              }
            }
            subject.chapters = chapters;
          } else {
            subject.chapters = [];
          }
        }

        this.subjects = subjects;
      } catch (error) {
        console.error("Error fetching subjects or chapters:", error);
      }
    },
    toggleSubject(subjectId) {
      const index = this.expandedSubjects.indexOf(subjectId);
      if (index > -1) {
        this.expandedSubjects.splice(index, 1);
      } else {
        this.expandedSubjects.push(subjectId);
      }
    },
    isSubjectExpanded(subjectId) {
      return this.expandedSubjects.includes(subjectId);
    },
    toggleChapter(chapterId) {
      const index = this.expandedChapters.indexOf(chapterId);
      if (index > -1) {
        this.expandedChapters.splice(index, 1);
      } else {
        this.expandedChapters.push(chapterId);
      }
    },
    isChapterExpanded(chapterId) {
      return this.expandedChapters.includes(chapterId);
    }
  }
};
