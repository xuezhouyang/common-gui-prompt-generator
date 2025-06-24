import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

export function useUpload() {
  const [loading, setLoading] = useState(false)

  const upload = async (
    images: File[],
    description: string,
    model: string
  ) => {
    const form = new FormData()
    images.forEach((f) => form.append('images', f))
    form.append('description', description)
    setLoading(true)
    try {
      const { data } = await axios.post(`/api/generateDsl?model=${model}`, form)
      return data.dsl
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return { upload, loading }
}
