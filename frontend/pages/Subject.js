export default {
    template: `
        <div class="container mt-4">
            <h2 class="mb-3 text-center">All Chapters</h2>

            <div class="d-flex justify-content-between align-items-center mb-4">
                <input type="text" class="form-control w-50" v-model="searchQuery" placeholder="Search chapters...">
                <button class="btn btn-primary mb-3" @click="openModal"> + Add Chapter</button>
            </div>

            <div class="row">
                <div v-if="filteredChapters.length > 0" class="w-100">
                    <div class="row">
                        <div class="col-lg-4 col-md-6 mb-4" v-for="chapter in filteredChapters" :key="chapter.id">
                            <div class="card custom-card d-flex flex-column justify-content-between h-100 w-100">
                                <div class="card-body flex-grow-1">
                                    <h5 class="card-title">{{ chapter.name }}</h5>
                                    <p class="card-text">{{ chapter.description }}</p>
                                </div>
                                <div class="card-footer bg-white border-0 text-center">
                                    <button class="btn btn-warning mx-2" @click="editChapter(chapter)">Edit</button>
                                    <button class="btn btn-danger mx-2" @click="deleteChapter(chapter.id)">Delete</button>
                                    <router-link :to="'/subject/' + subjectId + '/chapter/' + chapter.id " class="btn btn-success mx-2">Check Quiz</router-link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="col-12">
                    <p class="text-muted text-center">No chapters found.</p>
                </div>
            </div>

            <div class="modal fade" id="chapterModal" tabindex="-1" role="dialog">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">{{ isEdit ? 'Edit' : 'Add' }} Chapter</h5>
                            <button type="button" class="close" @click="closeModal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label for="chapterName">Name</label>
                                <input type="text" class="form-control" id="chapterName" v-model="chapter.name" required>
                            </div>
                            <div class="form-group">
                                <label for="chapterDescription">Description</label>
                                <textarea class="form-control" id="chapterDescription" v-model="chapter.description" required></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" @click="closeModal">Close</button>
                            <button type="button" class="btn btn-primary" @click="saveChapter">{{ isEdit ? 'Update' : 'Save' }}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data: function () {
        return {
            subjectId: null,
            chapters: [],
            searchQuery: "",
            chapter: { id: null, name: '', description: '' },
            isEdit: false
        };
    },
    computed: {
        filteredChapters: function () {
            if (!this.searchQuery) return this.chapters;
            var query = this.searchQuery.toLowerCase();
            return this.chapters.filter(function (chapter) {
                return chapter.name.toLowerCase().includes(query) || chapter.description.toLowerCase().includes(query);
            });
        }
    },
    watch: {
        '$route': function (to) {
            if (to.params.id) {
                this.subjectId = to.params.id;
                this.fetchChapters();
            }
        }
    },
    created: function () {
        this.subjectId = this.$route.params.id;
        if (this.subjectId) {
            this.fetchChapters();
        }
    },
    methods: {
        fetchChapters: async function () {
            if (!this.subjectId) return;
            var token = this.$store.state.auth_token;
            try {
                var res = await fetch(location.origin + "/api/subjects/" + this.subjectId + "/chapters", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": token
                    }
                });

                if (!res.ok) return;

                this.chapters = await res.json();
            } catch (error) {
                console.error("Error fetching chapters:", error);
            }
        },
        openModal: function () {
            this.isEdit = false;
            this.chapter = { id: null, name: '', description: '' };
            $('#chapterModal').modal('show');
        },
        closeModal: function () {
            $('#chapterModal').modal('hide');
        },
        saveChapter: async function () {
            if (!this.chapter.name.trim() || !this.chapter.description.trim()) {
                alert("Chapter name and description cannot be empty.");
                return;
            }

            var token = this.$store.state.auth_token;
            var url = this.isEdit 
                ? location.origin + "/api/subjects/" + this.subjectId + "/chapters/" + this.chapter.id
                : location.origin + "/api/subjects/" + this.subjectId + "/chapters";

            var method = this.isEdit ? "PUT" : "POST";

            try {
                var res = await fetch(url, {
                    method: method,
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": token
                    },
                    body: JSON.stringify(this.chapter)
                });

                if (!res.ok) return;

                this.fetchChapters();
                this.closeModal();
            } catch (error) {
                console.error("Error saving chapter:", error);
            }
        },
        editChapter: function (chapter) {
            this.isEdit = true;
            this.chapter = Object.assign({}, chapter);
            $('#chapterModal').modal('show');
        },
        deleteChapter: async function (chapterId) {
            if (!confirm("Are you sure you want to delete this chapter?")) return;

            var token = this.$store.state.auth_token;
            try {
                var res = await fetch(location.origin + "/api/subjects/" + this.subjectId + "/chapters/" + chapterId, {
                    method: "DELETE",
                    headers: { "Authentication-Token": token }
                });

                if (!res.ok) return;

                this.fetchChapters();
            } catch (error) {
                console.error("Error deleting chapter:", error);
            }
        }
    }
};
