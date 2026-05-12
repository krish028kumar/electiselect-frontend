import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("jwt_token");
      // Only redirect if we are not actively handling the login success flow
      if (!window.location.pathname.startsWith('/login-success')) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

api.getProfile = () => api.get("/student/profile");
api.getMe = () => api.get("/user/me");
api.completeProfile = (data) => api.post("/user/complete-profile", data);
api.getOpenElectives = () => api.get("/student/available-subjects");
api.getOpenStatus = () => api.get("/electives/open/status");
api.getMySelection = () => api.get("/student/my-selection");
api.selectOpenElective = (subjectId) => api.post(`/student/register/${subjectId}`);
api.getDeptElectives = () => api.get("/electives/dept");
api.getDeptStatus = () => api.get("/electives/dept/status");
api.getDeptMySelection = () => api.get("/electives/dept/my-selection");
api.submitDeptElectives = (selections) => api.post("/electives/dept/select", selections);

// Admin Dashboard Endpoints
api.getAdminDashboardStats = () => api.get("/admin/dashboard/stats");
api.getAdminDashboardStudents = () => api.get("/admin/dashboard/students");
api.getAdminDashboardSessions = () => api.get("/admin/dashboard/sessions");
api.getPopularElectives = (limit = 5) => api.get(`/admin/dashboard/popular-electives?limit=${limit}`);

// Student Management (System Admin)
api.getAdminStudents = ({ search, department, semester, eligible } = {}) =>
  api.get("/admin/students", {
    params: {
      ...(search ? { search } : {}),
      ...(department ? { department } : {}),
      ...(semester !== undefined && semester !== null && semester !== "" ? { semester } : {}),
      ...(eligible !== undefined && eligible !== null && eligible !== "" ? { eligible } : {}),
    },
  });

api.toggleStudentEligibility = (studentId) => api.patch(`/admin/students/${studentId}/eligibility`);

api.promoteStudent = (studentId) => api.patch(`/admin/students/${studentId}/promote`);
api.promoteStudentsBulk = (semester) => api.patch(`/admin/students/promote-bulk?semester=${semester}`);

// Admin Session Management
api.getAllSessions = () => api.get("/admin/sessions");
api.createSession = (data) => api.post("/admin/sessions", data);
api.activateSession = (id) => api.patch(`/admin/sessions/${id}/activate`);
api.deactivateSession = (id) => api.patch(`/admin/sessions/${id}/deactivate`);
api.uploadSubjects = (sessionId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post(`/admin/sessions/${sessionId}/upload-subjects`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export default api;
