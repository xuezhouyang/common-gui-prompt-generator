import { useEffect, useState } from 'react'
import NodeCard from './components/NodeCard'
import useUpload from './hooks/useUpload'
import { generateDsl, fetchTemplates } from './utils/api'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'

interface WorkflowNode {
  id: string
  title: string
  prompt: string
  inputs: any[]
  outputs: any[]
}

function App() {
  const maxImages = Number(import.meta.env.VITE_MAX_IMAGES) || 10
  const maxMb = Number(import.meta.env.VITE_MAX_UPLOAD_MB) || 5
  const { files, onDrop, remove } = useUpload(maxImages, maxMb)
  const [description, setDescription] = useState('')
  const [model, setModel] = useState(localStorage.getItem('model') || 'gemini')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<WorkflowNode[]>([])
  const [templates, setTemplates] = useState<any[]>([])

  useEffect(() => {
    fetchTemplates().then(res => setTemplates(res.data))
  }, [])

  const upload = async () => {
    if (files.length === 0) return
    setLoading(true)
    const form = new FormData()
    files.forEach(f => form.append('images', f))
    form.append('description', description)
    try {
      const { data } = await generateDsl(model, form)
      setResult(data.workflow)
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Error')
    } finally {
      setLoading(false)
    }
  }

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setModel(value)
    localStorage.setItem('model', value)
  }

  const loadExample = () => {
    setDescription('示例：预订上海迪士尼附近的酒店')
    setResult(templates as any)
  }

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">GUI-Agent DSL Generator</h1>
      <div>
        <label className="block mb-1">上传截图 (≤{maxImages}张, {maxMb}MB)</label>
        <input
          aria-label="upload images"
          type="file"
          multiple
          accept="image/*"
          onChange={e => onDrop(e.target.files)}
          className="border p-2 w-full"
        />
        <div className="flex flex-wrap mt-2 space-x-2">
          {files.map((f, i) => (
            <div key={i} className="relative">
              <img src={URL.createObjectURL(f)} alt={f.name} className="w-20 h-20 object-cover" />
              <button aria-label="remove" onClick={() => remove(i)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5">x</button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block mb-1">场景描述 ({description.length}字)</label>
        <textarea
          aria-label="description"
          className="border p-2 w-full"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>

      <div className="space-x-2">
        <select aria-label="model" value={model} onChange={handleModelChange} className="border p-2">
          <option value="gemini">Gemini</option>
          <option value="openai">OpenAI</option>
        </select>
        <button onClick={upload} aria-label="generate" className="px-4 py-2 bg-blue-500 text-white rounded" disabled={loading}>
          {loading ? '生成中...' : '生成'}
        </button>
        <button onClick={loadExample} aria-label="load example" className="px-4 py-2 bg-gray-200 rounded">🚀 载入示例</button>
      </div>

      {result.length > 0 && (
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <pre className="bg-gray-800 text-green-400 p-2 rounded overflow-auto" aria-label="json">{JSON.stringify({ workflow: result }, null, 2)}</pre>
          <div className="space-y-2">
            {result.map(node => (
              <NodeCard key={node.id} node={node} />
            ))}
          </div>
        </div>
      )}
      <ToastContainer position="bottom-center" />
    </div>
  )
}

export default App
