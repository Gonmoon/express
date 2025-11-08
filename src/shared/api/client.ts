import axios from 'axios'

export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 5000,
})

apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)