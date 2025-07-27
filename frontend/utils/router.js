import AdminDashboard from "../pages/AdminDashboard.js";
import Home from "../pages/Home.js";
import LoginPage from "../pages/LoginPage.js";
import Register from "../pages/Register.js";
import Subject from "../pages/Subject.js";
import Chapter from "../pages/Chapter.js"; 
import Question from "../pages/Question.js";
import AdminSummary from "../pages/AdminSummary.js";
import UserDashboard from "../pages/UserDashboard.js";
import TakeQuiz from "../pages/TakeQuiz.js";
import UserProfile from "../pages/UserProfile.js";
import UserSummary from "../pages/UserSummary.js";
import UserScore from "../pages/UserScore.js";
import ExportReports from "../pages/ExportReports.js";
import UserManagement from "../pages/UserManagement.js";
import AdminUserSummary from "../pages/AdminUserSummary.js";
import UserExportReports from "../pages/UserExportReports.js"

const routes = [
  { path: "/", component: Home },
  { path: "/login", component: LoginPage },
  { path: "/register", component: Register },
  { path: "/admin-dashboard", component: AdminDashboard },
  { path: "/admin-summary", component: AdminSummary },
  { path: "/subject/:id", component: Subject },
  { path: "/subject/:subject_id/chapter/:chapter_id", component: Chapter },
  { path: "/subject/:subject_id/chapter/:chapter_id/quiz/:quiz_id", component: Question },
  { path: "/user-dashboard", component: UserDashboard },
  { path: "/take-quiz/:subject_id/:chapter_id/:quiz_id", component: TakeQuiz },
  { path: "/profile", component: UserProfile },
  { path: "/user-summary", component: UserSummary },
  { path: '/user-export', component: UserExportReports },
  { path: '/admin-users', component: UserManagement },
  { path: '/admin-export', component: ExportReports },
  {path: "/user-score",component: UserScore},
  { path: "/admin-user-summary/:id", component: AdminUserSummary },

];

const router = new VueRouter({

  routes
});

export default router;
