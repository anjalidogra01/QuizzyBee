export default {
    template: `
        <div class="container mt-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <input type="text" class="form-control w-50" v-model="searchQuery" placeholder="Search subjects...">
                <button class="btn btn-primary mb-3" @click="openModal"> + Add Subject</button>
            </div>

            <div class="row">
                <div v-if="filteredSubjects.length > 0" class="w-100">
                    <div class="row">
                        <div class="col-lg-4 col-md-6 mb-4" v-for="subject in filteredSubjects" :key="subject.id">
                            <div class="card custom-card d-flex flex-column justify-content-between h-100 w-100">

                                <!-- 🔥 Subject Image -->
                                <img
                                    v-if="subject.image"
                                    :src="subject.image.startsWith('http') ? subject.image : 'styles/uploads/images' + subject.image"
                                    class="card-img-top"
                                    style="height: 180px; object-fit: cover;"
                                    alt="Subject Image"
                                />

                                <div class="card-body flex-grow-1">
                                    <h5 class="card-title">{{ subject.name }}</h5>
                                    <p class="card-text">{{ subject.description }}</p>
                                </div>
                                <div class="card-footer bg-white border-0 text-center">
                                    <button class="btn btn-info" @click="openSubject(subject.id)">Open</button>
                                    <button class="btn btn-warning mx-2" @click="editSubject(subject)">Edit</button>
                                    <button class="btn btn-danger" @click="deleteSubject(subject.id)">Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="col-12">
                    <p class="text-muted text-center">No subjects found.</p>
                </div>
            </div>

            <div class="modal fade" id="subjectModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="exampleModalLabel">{{ isEdit ? 'Edit' : 'Add' }} Subject</h5>
                            <button type="button" class="close" @click="closeModal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label for="subjectName">Name</label>
                                <input type="text" class="form-control" id="subjectName" v-model="subject.name" placeholder="Enter subject name" required>
                            </div>
                            <div class="form-group">
                                <label for="subjectDescription">Description</label>
                                <textarea class="form-control" id="subjectDescription" v-model="subject.description" placeholder="Enter description" required></textarea>
                            </div>
                            <div class="form-group">
                                <label for="subjectImage">Image URL (Optional)</label>
                                <input type="text" class="form-control" id="subjectImage" v-model="subject.image" placeholder="Enter image URL">
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" @click="closeModal">Close</button>
                            <button type="button" class="btn btn-primary" @click="saveSubject">{{ isEdit ? 'Update' : 'Save' }}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            adminData: null,
            message: null,
            messageClass: null,
            subjects: [],
            searchQuery: "",
            subject: {
                id: null,
                name: '',
                description: '',
                image: ''
            },
            isEdit: false
        };
    },
    computed: {
        filteredSubjects() {
            if (!this.searchQuery) {
                return this.subjects;
            }
            const query = this.searchQuery.toLowerCase();
            return this.subjects.filter(subject => 
                subject.name.toLowerCase().includes(query) || 
                subject.description.toLowerCase().includes(query)
            );
        }
    },
    async created() {
        const token = this.$store.state.auth_token;
        if (!token) {
            this.message = "Unauthorized access! Redirecting...";
            this.messageClass = "alert alert-danger";
            setTimeout(() => {
                this.$router.push("/login");
            }, 2000);
            return;
        }
        try {
            const res = await fetch(`${location.origin}/admin-dashboard`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": token
                }
            });
            const data = await res.json();
            if (res.ok) {
                this.adminData = data.admin_details;
            } else {
                this.message = data.message || "Failed to fetch admin data!";
                this.messageClass = "alert alert-danger";
            }
        } catch (error) {
            this.message = "An error occurred while fetching admin data.";
            this.messageClass = "alert alert-danger";
        }
        this.fetchSubjects();
    },
    methods: {
        async fetchSubjects() {
            const token = this.$store.state.auth_token;
            try {
                const res = await fetch(`${location.origin}/api/subjects`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": token
                    }
                });
                const data = await res.json();
                if (res.ok) {
                    this.subjects = data;
                } else {
                    this.message = data.message || "Failed to fetch subjects!";
                    this.messageClass = "alert alert-danger";
                }
            } catch (error) {
                this.message = "An error occurred while fetching subjects.";
                this.messageClass = "alert alert-danger";
            }
        },
        openModal() {
            this.isEdit = false;
            this.subject = { id: null, name: '', description: '', image: '' };
            $('#subjectModal').modal('show');
        },
        closeModal() {
            $('#subjectModal').modal('hide');
        },
        async saveSubject() {
            const token = this.$store.state.auth_token;
            const url = this.isEdit ? `${location.origin}/api/subjects/${this.subject.id}` : `${location.origin}/api/subjects`;
            const method = this.isEdit ? "PUT" : "POST";
            try {
                const res = await fetch(url, {
                    method,
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": token
                    },
                    body: JSON.stringify(this.subject)
                });
                if (res.ok) {
                    this.fetchSubjects();
                    this.closeModal();
                }
            } catch (error) {
                this.message = "An error occurred while saving subject.";
                this.messageClass = "alert alert-danger";
            }
        },
        editSubject(subject) {
            this.isEdit = true;
            this.subject = { ...subject };
            $('#subjectModal').modal('show');
        },
        async deleteSubject(subjectId) {
            if (!confirm("Are you sure you want to delete this subject?")) return;
            const token = this.$store.state.auth_token;
            try {
                await fetch(`${location.origin}/api/subjects/${subjectId}`, { method: "DELETE", headers: { "Authentication-Token": token } });
                this.fetchSubjects();
            } catch (error) {}
        },
        openSubject(subjectId) {
            this.$router.push(`/subject/${subjectId}`);
        }
    }
};
