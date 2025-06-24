import { useState } from 'react'
import { Clipboard, ChevronDown, ChevronUp } from 'lucide-react'

interface Node {
  id: string
  title: string
  prompt: string
  inputs: any[]
  outputs: any[]
}

export default function NodeCard({ node }: { node: Node }) {
  const [open, setOpen] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(JSON.stringify(node, null, 2))
  }

  return (
    <div className="border rounded-md p-4 bg-white shadow-sm" aria-label={node.title}>
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setOpen(!open)}>
        <h3 className="font-semibold text-lg">{node.title}</h3>
        {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>
      {open && (
        <div className="mt-2 text-sm space-y-1">
          <p><strong>ID:</strong> {node.id}</p>
          <p><strong>Prompt:</strong> {node.prompt}</p>
          <p><strong>Inputs:</strong> {JSON.stringify(node.inputs)}</p>
          <p><strong>Outputs:</strong> {JSON.stringify(node.outputs)}</p>
          <button
            aria-label="copy node"
            onClick={copy}
            className="mt-2 inline-flex items-center text-blue-500 hover:underline"
          >
            <Clipboard size={16} className="mr-1" />复制
          </button>
        </div>
      )}
    </div>
  )
}
