import axios from 'axios'

export const fetchTemplates = async () => {
  const { data } = await axios.get('/api/templates')
  return data
}
