import { useState } from 'react'
import { ClipboardCopy } from 'lucide-react'

interface IOItem {
  name: string
  type: string
  desc: string
}

interface Node {
  id: string
  title: string
  prompt: string
  inputs: IOItem[]
  outputs: IOItem[]
}

export default function NodeCard({ node }: { node: Node }) {
  const [copied, setCopied] = useState(false)

  const copyPrompt = () => {
    navigator.clipboard.writeText(node.prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="border rounded p-4 mb-4 bg-white">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">{node.title}</h3>
        <button aria-label="copy prompt" onClick={copyPrompt} className="text-sm">
          <ClipboardCopy className="inline" size={16} /> {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p className="mt-2 text-gray-700 whitespace-pre-wrap">{node.prompt}</p>
      <div className="mt-2">
        <strong>Inputs:</strong>
        <ul className="list-disc ml-5">
          {node.inputs.map((i) => (
            <li key={i.name}>{i.name} ({i.type}) - {i.desc}</li>
          ))}
        </ul>
      </div>
      <div className="mt-2">
        <strong>Outputs:</strong>
        <ul className="list-disc ml-5">
          {node.outputs.map((o) => (
            <li key={o.name}>{o.name} ({o.type}) - {o.desc}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
