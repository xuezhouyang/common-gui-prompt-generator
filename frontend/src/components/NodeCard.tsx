import { useState } from 'react'
import { ChevronDown, ChevronUp, Clipboard } from 'lucide-react'
import { motion } from 'framer-motion'

interface IOItem {
  name: string
  type: string
  desc: string
}

export interface Node {
  id: string
  title: string
  prompt: string
  inputs: IOItem[]
  outputs: IOItem[]
}

export default function NodeCard({ node }: { node: Node }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border rounded bg-white shadow-sm mb-2" aria-label={node.title}>
      <button
        className="w-full flex items-center justify-between p-2"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Collapse node' : 'Expand node'}
      >
        <span className="font-medium text-left">{node.title}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          className="px-4 pb-4 text-sm"
        >
          <p className="mb-1"><b>Prompt:</b> {node.prompt}</p>
          <div className="mb-1">
            <b>Inputs:</b>
            <ul className="list-disc list-inside">
              {node.inputs.map((i) => (
                <li key={i.name}>{`${i.name} (${i.type}) - ${i.desc}`}</li>
              ))}
            </ul>
          </div>
          <div className="mb-1">
            <b>Outputs:</b>
            <ul className="list-disc list-inside">
              {node.outputs.map((o) => (
                <li key={o.name}>{`${o.name} (${o.type}) - ${o.desc}`}</li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(JSON.stringify(node, null, 2))}
            className="mt-2 flex items-center text-blue-600 hover:underline"
            aria-label="Copy node JSON"
          >
            <Clipboard size={14} className="mr-1" /> Copy Node JSON
          </button>
        </motion.div>
      )}
    </div>
  )
}
