import axios from 'axios'

const instance = axios.create({
  baseURL: '/api',
  timeout: 60000
})

instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      window.location.reload()
    }
    return Promise.reject(error)
  }
)

export const adminApi = {
  login: (data) => instance.post('/admin/login', data),
  logout: () => instance.post('/admin/logout')
}

export const accountsApi = {
  list: () => instance.get('/accounts'),
  regions: () => instance.get('/accounts/regions'),
  get: (id) => instance.get(`/accounts/${id}`),
  create: (data) => instance.post('/accounts', data),
  update: (id, data) => instance.put(`/accounts/${id}`, data),
  delete: (id) => instance.delete(`/accounts/${id}`)
}

export const queryApi = {
  byRegion: (data) => instance.post('/query/by-region', data),
  records: (params) => instance.get('/query/records', { params })
}

export const submitApi = {
  submit: (data) => instance.post('/submit', data),
  records: (params) => instance.get('/submit', { params })
}