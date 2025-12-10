import axios from 'axios'
import { apiConfig } from '@infrastructure/config/api.config'

export const httpClient = axios.create({
  baseURL: apiConfig.baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiConfig.token}`,
  },
})

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)
