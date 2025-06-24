import { useState, useCallback } from 'react'

export default function useUpload(maxImages: number, maxMb: number) {
  const [files, setFiles] = useState<File[]>([])

  const onDrop = useCallback((items: FileList | null) => {
    if (!items) return
    const arr = Array.from(items)
    if (arr.length + files.length > maxImages) {
      alert('Too many files')
      return
    }
    const valid = arr.filter(f => f.size <= maxMb * 1024 * 1024 && f.type.startsWith('image/'))
    setFiles(prev => [...prev, ...valid])
  }, [files, maxImages, maxMb])

  const remove = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  return { files, onDrop, remove }
}
