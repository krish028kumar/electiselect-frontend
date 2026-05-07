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
api.getMySelection = () => api.get("/student/my-selection");
api.selectOpenElective = (subjectId) => api.post(`/student/register/${subjectId}`);
api.getDeptElectives = () => api.get("/electives/dept");
api.submitDeptElectives = (selections) => api.post("/electives/dept/select", selections);

export default api;
