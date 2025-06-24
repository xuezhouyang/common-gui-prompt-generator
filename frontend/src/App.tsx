import { useEffect, useState } from 'react'
import NodeCard, { Node } from './components/NodeCard'
import useUpload from './hooks/useUpload'
import { generateDsl, fetchTemplates } from './utils/api'
import { Select, SelectItem } from '@radix-ui/react-select'
import { Textarea } from '@radix-ui/themes'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const MODELS = [
  { label: 'Gemini 2.5 Flash', value: 'gemini' },
  { label: 'ChatGPT 4.1', value: 'openai' },
]

export default function App() {
  const { files, setFiles, dragging, handleDragOver, handleDragLeave, handleDrop, handleChange } =
    useUpload(10)
  const [desc, setDesc] = useState('')
  const [model, setModel] = useState(() => localStorage.getItem('model') || 'gemini')
  const [dsl, setDsl] = useState('')
  const [nodes, setNodes] = useState<Node[]>([])
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<any[]>([])

  useEffect(() => {
    fetchTemplates().then(setTemplates)
  }, [])

  async function onGenerate() {
    if (!files.length) return toast.error('请先选择图片')
    setLoading(true)
    try {
      const result = await generateDsl(files, desc, model as 'gemini' | 'openai')
      setDsl(result)
      setNodes(JSON.parse(result).workflow)
    } catch (e: any) {
      toast.error(e.response?.data?.detail || '生成失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-4 space-x-2">
        <label htmlFor="model">模型:</label>
        <select
          id="model"
          value={model}
          onChange={(e) => {
            setModel(e.target.value)
            localStorage.setItem('model', e.target.value)
          }}
          className="border p-1 rounded"
          aria-label="选择模型"
        >
          {MODELS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <div className="ml-auto">
          <select
            onChange={(e) => {
              const idx = Number(e.target.value)
              const t = templates[idx]
              if (!t) return
              setDsl(JSON.stringify(t, null, 2))
              setNodes(t.nodes)
            }}
            aria-label="载入示例"
            className="border p-1 rounded"
          >
            <option value="">🚀 载入示例</option>
            {templates.map((t, i) => (
              <option key={t.id} value={i}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded p-4 text-center mb-2 ${dragging ? 'border-blue-500 bg-blue-50' : ''}`}
            aria-label="上传区域"
          >
            <input type="file" multiple accept="image/*" onChange={handleChange} className="hidden" id="uploader" />
            <label htmlFor="uploader" className="cursor-pointer">拖拽或点击选择图片</label>
            <div className="text-sm mt-2">已选 {files.length} 张</div>
          </div>
          <Textarea
            size="3"
            className="w-full"
            placeholder="描述场景..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            aria-label="场景描述"
          />
          <div className="text-right text-xs text-gray-500">{desc.length} 字</div>
          <button
            onClick={onGenerate}
            disabled={loading}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded w-full"
            aria-label="生成 DSL"
          >
            {loading ? '生成中...' : '生成 DSL'}
          </button>
        </div>
        <div className="lg:col-span-2 grid lg:grid-cols-2 gap-4 mt-4 lg:mt-0">
          <pre className="bg-gray-800 text-green-300 p-2 rounded overflow-auto" aria-label="原始 JSON">
{dsl}
          </pre>
          <div>
            {nodes.map((n) => (
              <NodeCard key={n.id} node={n} />
            ))}
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" />
    </div>
  )
}
