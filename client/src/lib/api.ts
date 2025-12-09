import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('auth-storage')
  if (stored) {
    try {
      const { state } = JSON.parse(stored)
      if (state?.session?.access_token) {
        config.headers.Authorization = `Bearer ${state.session.access_token}`
      }
    } catch (e) {
      // Ignore parse errors
    }
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Chatbots API
export const chatbotsApi = {
  getAll: () => api.get('/chatbots'),
  getById: (id: string) => api.get(`/chatbots/${id}`),
  create: (data: any) => api.post('/chatbots', data),
  update: (id: string, data: any) => api.put(`/chatbots/${id}`, data),
  delete: (id: string) => api.delete(`/chatbots/${id}`),
  toggleStatus: (id: string) => api.post(`/chatbots/${id}/toggle-status`)
}

// Templates API
export const templatesApi = {
  getAll: () => api.get('/templates'),
  getById: (id: string) => api.get(`/templates/${id}`),
  create: (data: any) => api.post('/templates', data),
  update: (id: string, data: any) => api.put(`/templates/${id}`, data),
  delete: (id: string) => api.delete(`/templates/${id}`)
}

// Conversations API
export const conversationsApi = {
  getAll: (chatbotId?: string) => api.get('/conversations', { params: { chatbotId } }),
  getById: (id: string) => api.get(`/conversations/${id}`),
  create: (data: any) => api.post('/conversations', data),
  addMessage: (id: string, content: string, role = 'user') => 
    api.post(`/conversations/${id}/messages`, { content, role })
}

// Analytics API
export const analyticsApi = {
  getOverview: () => api.get('/analytics-dashboard/overview'),
  getConversations: () => api.get('/analytics-dashboard/conversations'),
  getTemplates: () => api.get('/analytics-dashboard/templates'),
  getUserEngagement: () => api.get('/analytics-dashboard/user-engagement'),
  getResponseQuality: () => api.get('/analytics-dashboard/response-quality'),
  getAll: () => api.get('/analytics-dashboard')
}

export default api
