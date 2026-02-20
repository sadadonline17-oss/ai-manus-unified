import { useState } from 'react'
import { Play, Pause, Plus, Save, Upload, Download, Trash2 } from 'lucide-react'
import WorkflowBuilder from '../components/workflow/WorkflowBuilder'

interface WorkflowNode {
  id: string
  type: string
  name: string
  config: Record<string, any>
}

interface Workflow {
  id: string
  name: string
  nodes: WorkflowNode[]
  edges: { source: string; target: string }[]
  status: 'idle' | 'running' | 'completed' | 'error'
}

export default function WorkflowView() {
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: '1',
      name: 'Example Workflow',
      nodes: [
        { id: '1', type: 'start', name: 'Start', config: {} },
        { id: '2', type: 'ai', name: 'AI Process', config: { provider: 'openai', model: 'gpt-4' } },
        { id: '3', type: 'end', name: 'End', config: {} },
      ],
      edges: [
        { source: '1', target: '2' },
        { source: '2', target: '3' },
      ],
      status: 'idle',
    },
  ])
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(workflows[0])
  const [isRunning, setIsRunning] = useState(false)

  const nodeTypes = [
    { type: 'start', label: 'Start', color: '#a6e3a1' },
    { type: 'ai', label: 'AI Task', color: '#cba6f7' },
    { type: 'tool', label: 'Tool', color: '#89b4fa' },
    { type: 'condition', label: 'Condition', color: '#f9e2af' },
    { type: 'parallel', label: 'Parallel', color: '#94e2d5' },
    { type: 'end', label: 'End', color: '#f38ba8' },
  ]

  const createNewWorkflow = () => {
    const newWorkflow: Workflow = {
      id: Date.now().toString(),
      name: `Workflow ${workflows.length + 1}`,
      nodes: [
        { id: '1', type: 'start', name: 'Start', config: {} },
        { id: '2', type: 'end', name: 'End', config: {} },
      ],
      edges: [],
      status: 'idle',
    }
    setWorkflows([...workflows, newWorkflow])
    setSelectedWorkflow(newWorkflow)
  }

  const runWorkflow = async () => {
    if (!selectedWorkflow || isRunning) return
    
    setIsRunning(true)
    // Simulate workflow execution
    setTimeout(() => {
      setIsRunning(false)
    }, 3000)
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-64 bg-[#181825] border-r border-[#313244] flex flex-col">
        <div className="p-4 border-b border-[#313244]">
          <button
            onClick={createNewWorkflow}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#cba6f7] hover:bg-[#b4befe] text-[#1e1e2e] rounded-lg transition-colors"
          >
            <Plus size={18} />
            <span>New Workflow</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {workflows.map((workflow) => (
            <button
              key={workflow.id}
              onClick={() => setSelectedWorkflow(workflow)}
              className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${
                selectedWorkflow?.id === workflow.id
                  ? 'bg-[#313244] text-[#cba6f7]'
                  : 'text-[#cdd6f4] hover:bg-[#313244]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="truncate">{workflow.name}</span>
                <div className={`w-2 h-2 rounded-full ${
                  workflow.status === 'running' ? 'bg-[#f9e2af]' :
                  workflow.status === 'completed' ? 'bg-[#a6e3a1]' :
                  workflow.status === 'error' ? 'bg-[#f38ba8]' : 'bg-[#6c7086]'
                }`} />
              </div>
            </button>
          ))}
        </div>

        {/* Node Types */}
        <div className="p-4 border-t border-[#313244]">
          <p className="text-xs text-[#a6adc8] mb-2">Drag to add nodes</p>
          <div className="grid grid-cols-2 gap-2">
            {nodeTypes.map((node) => (
              <div
                key={node.type}
                draggable
                className="flex items-center gap-2 px-2 py-1.5 bg-[#313244] rounded cursor-move hover:bg-[#45475a] transition-colors"
              >
                <div className="w-3 h-3 rounded" style={{ backgroundColor: node.color }} />
                <span className="text-xs text-[#cdd6f4]">{node.label}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Toolbar */}
        <header className="px-4 py-3 border-b border-[#313244] bg-[#181825] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-[#cdd6f4]">
              {selectedWorkflow?.name || 'No Workflow Selected'}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={runWorkflow}
              disabled={!selectedWorkflow || isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-[#a6e3a1] hover:bg-[#94e2d5] disabled:bg-[#45475a] disabled:cursor-not-allowed text-[#1e1e2e] rounded-lg transition-colors"
            >
              {isRunning ? <Pause size={18} /> : <Play size={18} />}
              <span>{isRunning ? 'Running...' : 'Run'}</span>
            </button>
            <button className="p-2 hover:bg-[#313244] rounded-lg transition-colors text-[#a6adc8]">
              <Save size={18} />
            </button>
            <button className="p-2 hover:bg-[#313244] rounded-lg transition-colors text-[#a6adc8]">
              <Upload size={18} />
            </button>
            <button className="p-2 hover:bg-[#313244] rounded-lg transition-colors text-[#a6adc8]">
              <Download size={18} />
            </button>
            <button className="p-2 hover:bg-[#313244] rounded-lg transition-colors text-[#f38ba8]">
              <Trash2 size={18} />
            </button>
          </div>
        </header>

        {/* Workflow Canvas */}
        <div className="flex-1 bg-[#1e1e2e] relative overflow-hidden">
          {selectedWorkflow ? (
            <WorkflowBuilder workflow={selectedWorkflow} isRunning={isRunning} />
          ) : (
            <div className="flex items-center justify-center h-full text-[#a6adc8]">
              <div className="text-center">
                <p className="text-lg mb-2">No workflow selected</p>
                <p className="text-sm">Create a new workflow or select an existing one</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}