# 🐝 QuizzyBee - AI-Powered Quiz Platform

QuizzyBee is an intelligent quiz management system that leverages **Google Gemini AI** to automatically generate multiple-choice questions, making quiz creation effortless for educators and learning engaging for students.
---

## ✨ Features

### 🤖 AI Question Generation
- Auto-generate quizzes on any topic using Google Gemini API
- Adjustable difficulty levels (Easy/Medium/Hard)
- Review and select questions before saving

### 👥 Role-Based Access
- **Admin Dashboard**: Manage subjects, chapters, quizzes, and users
- **User Dashboard**: Take quizzes, track progress, view performance

### 📊 Analytics & Reporting
- Interactive charts (Quiz counts, Pass/Fail stats, Top performers)
- CSV export for offline analysis
- Performance trends over time

### 📧 Automated Email System
- Daily reminders for inactive users (Celery tasks)
- Monthly performance reports
- Instant notifications for new quizzes

### 🔐 Security
- JWT-based authentication
- Password hashing with Flask-Security
- Role-based access control

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| Frontend | Vue.js, HTML5, CSS3, Bootstrap, Chart.js |
| Backend | Flask, Flask-RESTful, SQLAlchemy |
| AI | Google Gemini API |
| Task Queue | Celery, Redis |
| Database | SQLite / PostgreSQL |
| Authentication | JWT, Flask-Security |
| Email | Flask-Mail |

---

## 🚀 Installation

### Prerequisites
- Python 3.10+
- Redis server (for Celery)
- Gemini API key

### Setup Steps

**1. Clone the repository**
```bash
git clone https://github.com/anjalidogra01/QuizzyBee.git
cd QuizzyBee
```

**2. Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

**3. Install dependencies**
```bash
pip install -r requirements.txt
```

**4. Set up environment variables**
Create a `.env` file:
```env
ADMIN_EMAIL=your_email@example.com
ADMIN_PASSWORD=your_password
GEMINI_API_KEY=your_gemini_api_key
```

**5. Initialize database**
```bash
python create_initial_data_demo.py
```

**6. Run Redis server**
```bash
redis-server
```

**7. Start Celery worker** (new terminal)
```bash
celery -A backend.celery_app.celery worker --loglevel=info
```

**8. Start Celery beat** (new terminal)
```bash
celery -A backend.celery_app.celery beat --loglevel=info
```

**9. Run Flask application**
```bash
python app.py
```

**10. Access the application**
- Open browser: `http://localhost:5000`
- Login with admin credentials from `.env`

---

## 📁 Project Structure

```
QuizzyBee/
├── app.py                 # Flask application entry point
├── backend/
│   ├── models.py         # Database models
│   ├── apis/             # REST API endpoints
│   ├── tasks.py          # Celery tasks
│   ├── celery_app.py     # Celery configuration
│   └── config.py         # Configuration
├── static/
│   ├── pages/            # Vue.js components
│   ├── styles/           # CSS files
│   └── utils/            # Router & Store
└── templates/            # HTML templates
```

---

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subjects` | Get all subjects |
| POST | `/api/subjects` | Create subject |
| GET | `/api/subjects/<id>/chapters` | Get chapters |
| POST | `/api/generate-ai-quiz` | Generate AI questions |
| GET | `/api/scores` | Get user scores |
| GET | `/api/summary` | Get analytics summary |
| GET | `/api/admin/export` | Export CSV report |

---

## 📧 Email Automation Schedule

| Task | Schedule | Description |
|------|----------|-------------|
| Daily Reminders | Every day at 11:14 PM | Sent to users inactive for 24+ hours |
| Monthly Reports | 30th of each month at 11:14 PM | Monthly performance summary |
| New Quiz Alerts | Instant | Notification when admin creates a quiz |

---

## 🐛 Common Issues & Fixes

### Issue 1: Module not found errors
```bash
# Make sure you're in the correct directory and virtual env is activated
pip install -r requirements.txt
```

### Issue 2: Redis connection failed
```bash
# Make sure Redis server is running
redis-server
```

### Issue 3: Database errors
```bash
# Delete existing database and re-initialize
rm instance/quizmaster.db
python create_initial_data_demo.py
```

### Issue 4: Celery tasks not running
```bash
# Make sure both worker and beat are running in separate terminals
celery -A backend.celery_app.celery worker --loglevel=info
celery -A backend.celery_app.celery beat --loglevel=info
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👩‍💻 Author

**Anjali Dogra**

- GitHub: [@anjalidogra01](https://github.com/anjalidogra01)
- Email: anjalidogra1806@gmail.com

---

## 🙏 Acknowledgments

- Google Gemini AI for question generation
- Flask and Vue.js communities
- Microsoft for Startups program

---

## 📞 Contact

For any queries or support, please reach out to anjalidogra1806@gmail.com

---

⭐ Star this repository if you found it useful!

```
