import { useState, useMemo } from 'react'
import WorkflowBuilder from '../components/workflow/WorkflowBuilder'
import { Node, Edge } from 'reactflow'

interface SkillDefinition {
  id: string
  name: string
  description: string
  category: string
  parameters: any[]
  outputs: any[]
  icon: string
  color: string
}

export default function WorkflowView() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])

  // Default skills for the workflow builder
  const skills: SkillDefinition[] = useMemo(() => [
    {
      id: 'start',
      name: 'Start',
      description: 'Starting point of the workflow',
      category: 'control',
      parameters: [],
      outputs: [{ name: 'output', type: 'any', description: 'Initial input' }],
      icon: '▶️',
      color: '#9ece6a',
    },
    {
      id: 'ai_task',
      name: 'AI Task',
      description: 'Execute an AI-powered task',
      category: 'ai',
      parameters: [
        { name: 'prompt', type: 'string', description: 'The prompt to send to the AI', required: true },
        { name: 'provider', type: 'string', description: 'AI provider to use', required: false, default: 'openai' },
      ],
      outputs: [{ name: 'response', type: 'string', description: 'AI response' }],
      icon: '🤖',
      color: '#d4b06a',
    },
    {
      id: 'http_request',
      name: 'HTTP Request',
      description: 'Make an HTTP request to an external API',
      category: 'integration',
      parameters: [
        { name: 'url', type: 'string', description: 'URL to request', required: true },
        { name: 'method', type: 'string', description: 'HTTP method', required: false, default: 'GET', options: ['GET', 'POST', 'PUT', 'DELETE'] },
      ],
      outputs: [{ name: 'response', type: 'object', description: 'HTTP response' }],
      icon: '🌐',
      color: '#7aa2f7',
    },
    {
      id: 'condition',
      name: 'Condition',
      description: 'Branch based on a condition',
      category: 'control',
      parameters: [
        { name: 'expression', type: 'string', description: 'Condition to evaluate', required: true },
      ],
      outputs: [
        { name: 'true', type: 'any', description: 'If condition is true' },
        { name: 'false', type: 'any', description: 'If condition is false' },
      ],
      icon: '🔀',
      color: '#e0af68',
    },
    {
      id: 'code_execute',
      name: 'Code Execute',
      description: 'Execute Python or JavaScript code',
      category: 'execution',
      parameters: [
        { name: 'code', type: 'string', description: 'Code to execute', required: true },
        { name: 'language', type: 'string', description: 'Programming language', required: false, default: 'python', options: ['python', 'javascript'] },
      ],
      outputs: [{ name: 'result', type: 'any', description: 'Execution result' }],
      icon: '💻',
      color: '#94e2d5',
    },
    {
      id: 'end',
      name: 'End',
      description: 'End point of the workflow',
      category: 'control',
      parameters: [],
      outputs: [],
      icon: '⏹️',
      color: '#f7768e',
    },
  ], [])

  const handleExecute = (workflow: { nodes: Node[]; edges: Edge[] }) => {
    console.log('Executing workflow:', workflow)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border bg-bg-secondary">
        <h1 className="text-xl font-semibold text-text-primary">Workflow Builder</h1>
        <p className="text-sm text-text-muted font-arabic">منشئ سير العمل</p>
      </header>
      
      {/* Workflow Canvas */}
      <div className="flex-1 bg-bg-primary">
        <WorkflowBuilder
          initialNodes={nodes}
          initialEdges={edges}
          onNodesChange={setNodes}
          onEdgesChange={setEdges}
          onExecute={handleExecute}
          skills={skills}
        />
      </div>
    </div>
  )
}