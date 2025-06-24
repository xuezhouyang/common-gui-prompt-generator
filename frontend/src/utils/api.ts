import axios from 'axios'

export const api = axios.create({ baseURL: '/api' })

export async function generateDsl(
  files: File[],
  description: string,
  model: 'gemini' | 'openai'
) {
  const formData = new FormData()
  files.forEach((f) => formData.append('images', f))
  formData.append('description', description)
  const { data } = await api.post(`/generateDsl?model=${model}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.dsl as string
}

export async function fetchTemplates() {
  const { data } = await api.get('/templates')
  return data
}
