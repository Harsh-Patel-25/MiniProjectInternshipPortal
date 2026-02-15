import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const internshipAPI = {
  getAll: (params) => api.get('/internships', { params }),
  getFeatured: () => api.get('/internships/featured'),
  getById: (id) => api.get(`/internships/${id}`),
  getCategories: () => api.get('/internships/categories'),
  create: (data) => api.post('/internships', data),
  update: (id, data) => api.put(`/internships/${id}`, data),
  delete: (id) => api.delete(`/internships/${id}`),
  getMine: () => api.get('/internships/company/mine'),
};

export const applicationAPI = {
  apply: (data) => api.post('/applications', data),
  getMy: () => api.get('/applications/my'),
  getForInternship: (id) => api.get(`/applications/internship/${id}`),
  updateStatus: (id, data) => api.put(`/applications/${id}/status`, data),
  withdraw: (id) => api.delete(`/applications/${id}`),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  saveInternship: (id) => api.post(`/users/save-internship/${id}`),
  getSaved: () => api.get('/users/saved-internships'),
};

export const companyAPI = {
  getAll: () => api.get('/companies'),
  getDashboard: () => api.get('/companies/dashboard'),
};

export default api;

export const adminAPI = {
  getStats: () => api.get('/internships/admin/stats'),
  getAllInternships: (params) => api.get('/internships/admin/all', { params }),
  deleteInternship: (id) => api.delete(`/internships/admin/${id}`),
  toggleActive: (id) => api.patch(`/internships/admin/${id}/toggle-active`),
  toggleFeatured: (id) => api.patch(`/internships/admin/${id}/toggle-featured`),
  getAllUsers: (params) => api.get('/users/admin/all', { params }),
  deleteUser: (id) => api.delete(`/users/admin/${id}`),
  changeRole: (id, role) => api.patch(`/users/admin/${id}/role`, { role }),
  getAllApplications: (params) => api.get('/applications/admin/all', { params }),
  deleteApplication: (id) => api.delete(`/applications/admin/${id}`),
  updateApplicationStatus: (id, status) => api.put(`/applications/admin/${id}/status`, { status }),
};
