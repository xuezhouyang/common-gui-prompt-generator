import { useState, DragEvent } from 'react'

export default function useUpload(maxFiles: number) {
  const [files, setFiles] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)

  function handleFiles(newFiles: FileList) {
    const selected = Array.from(newFiles).slice(0, maxFiles - files.length)
    setFiles((prev) => [...prev, ...selected])
  }

  return {
    files,
    setFiles,
    dragging,
    handleDragOver: (e: DragEvent) => {
      e.preventDefault()
      setDragging(true)
    },
    handleDragLeave: () => setDragging(false),
    handleDrop: (e: DragEvent) => {
      e.preventDefault()
      setDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) handleFiles(e.target.files)
    },
  }
}
