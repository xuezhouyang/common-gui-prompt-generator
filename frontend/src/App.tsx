import { useEffect, useRef, useState } from 'react'
import NodeCard from './components/NodeCard'
import { useUpload } from './hooks/useUpload'
import { fetchTemplates } from './utils/api'
import { Select, SelectItem } from '@radix-ui/react-select'
import { Textarea } from '@radix-ui/themes'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface Workflow {
  workflow: any[]
}

function App() {
  const [files, setFiles] = useState<File[]>([])
  const [desc, setDesc] = useState('')
  const [dsl, setDsl] = useState<Workflow | null>(null)
  const [model, setModel] = useState(localStorage.getItem('model') || 'gemini')
  const { upload, loading } = useUpload()
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    localStorage.setItem('model', model)
  }, [model])

  const handleFiles = (filesList: FileList | null) => {
    if (!filesList) return
    const arr = Array.from(filesList)
    setFiles(arr)
  }

  const handleGenerate = async () => {
    const result = await upload(files, desc, model)
    if (result) setDsl(result)
  }

  const loadExample = async () => {
    const data = await fetchTemplates()
    setDsl(data[0].dsl)
    toast.success('示例已加载')
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 flex items-center">
        GUI Agent Workflow Generator
        <button onClick={loadExample} className="ml-4 text-sm" aria-label="load example">🚀 载入示例</button>
      </h1>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-1/3">
          <div
            className="border-dashed border-2 rounded p-4 text-center cursor-pointer"
            onClick={() => inputRef.current?.click()}
          >
            <p className="mb-2">拖拽或点击上传图片 (最多10张)</p>
            <input
              type="file"
              ref={inputRef}
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <p>{files.length} 文件已选</p>
          </div>
          <Textarea
            className="mt-4 w-full"
            placeholder="请输入场景描述"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <p className="text-right text-sm text-gray-500">{desc.length} 字</p>
          <Select value={model} onValueChange={setModel}>
            <SelectItem value="gemini">Gemini</SelectItem>
            <SelectItem value="openai">OpenAI</SelectItem>
          </Select>
          <button
            aria-label="generate"
            onClick={handleGenerate}
            disabled={loading}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded w-full"
          >
            {loading ? '生成中...' : '生成 DSL'}
          </button>
        </div>
        <div className="lg:w-2/3">
          {dsl && (
            <div className="flex flex-col lg:flex-row gap-4">
              <pre className="bg-gray-900 text-green-400 p-2 overflow-auto lg:w-1/2">
                {JSON.stringify(dsl, null, 2)}
              </pre>
              <div className="lg:w-1/2">
                {dsl.workflow.map((node, idx) => (
                  <NodeCard key={idx} node={node} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}

export default App
