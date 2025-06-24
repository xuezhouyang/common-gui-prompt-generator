import axios from 'axios'

const api = axios.create({
  baseURL: '/api'
})

export const generateDsl = (model: string, data: FormData) =>
  api.post(`/generateDsl?model=${model}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

export const fetchTemplates = () => api.get('/templates')

export default api
