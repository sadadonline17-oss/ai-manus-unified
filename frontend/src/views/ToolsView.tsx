import { useState, useEffect } from 'react'
import { Terminal, FileText, Globe, Search, Play, Loader2 } from 'lucide-react'
import axios from 'axios'

const API_URL = 'http://localhost:8000'

interface Tool {
  name: string
  description: string
  category: string
}

const categoryIcons: Record<string, any> = {
  shell: Terminal,
  file: FileText,
  browser: Globe,
  search: Search,
}

const categoryColors: Record<string, string> = {
  shell: '#a6e3a1',
  file: '#89b4fa',
  browser: '#f9e2af',
  search: '#cba6f7',
}

export default function ToolsView() {
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [executing, setExecuting] = useState(false)

  useEffect(() => {
    fetchTools()
  }, [])

  const fetchTools = async () => {
    try {
      const response = await axios.get(`${API_URL}/tools`)
      setTools(response.data.tools)
    } catch (error) {
      console.error('Failed to fetch tools:', error)
    } finally {
      setLoading(false)
    }
  }

  const executeTool = async () => {
    if (!selectedTool || !input.trim()) return

    setExecuting(true)
    setOutput('')

    try {
      let parsedInput = {}
      try {
        parsedInput = JSON.parse(input)
      } catch {
        parsedInput = { input }
      }

      const response = await axios.post(`${API_URL}/tools/${selectedTool.name}/execute`, parsedInput)
      setOutput(JSON.stringify(response.data, null, 2))
    } catch (error: any) {
      setOutput(`Error: ${error.response?.data?.error || error.message}`)
    } finally {
      setExecuting(false)
    }
  }

  const groupedTools = tools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = []
    }
    acc[tool.category].push(tool)
    return acc
  }, {} as Record<string, Tool[]>)

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-72 bg-[#181825] border-r border-[#313244] overflow-y-auto">
        <div className="p-4 border-b border-[#313244]">
          <h2 className="text-lg font-semibold text-[#cdd6f4]">Tools</h2>
          <p className="text-sm text-[#a6adc8]">{tools.length} tools available</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 size={24} className="animate-spin text-[#cba6f7]" />
          </div>
        ) : (
          <div className="p-2">
            {Object.entries(groupedTools).map(([category, categoryTools]) => {
              const Icon = categoryIcons[category] || Terminal
              const color = categoryColors[category] || '#6c7086'
              
              return (
                <div key={category} className="mb-4">
                  <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-[#a6adc8] uppercase">
                    <Icon size={14} style={{ color }} />
                    <span>{category}</span>
                  </div>
                  {categoryTools.map((tool) => (
                    <button
                      key={tool.name}
                      onClick={() => {
                        setSelectedTool(tool)
                        setInput('')
                        setOutput('')
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${
                        selectedTool?.name === tool.name
                          ? 'bg-[#313244] text-[#cba6f7]'
                          : 'text-[#cdd6f4] hover:bg-[#313244]'
                      }`}
                    >
                      <div className="font-medium">{tool.name}</div>
                      <div className="text-xs text-[#6c7086] truncate">{tool.description}</div>
                    </button>
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {selectedTool ? (
          <>
            {/* Tool Header */}
            <header className="px-6 py-4 border-b border-[#313244] bg-[#181825]">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: categoryColors[selectedTool.category] + '20' }}
                >
                  {(() => {
                    const Icon = categoryIcons[selectedTool.category] || Terminal
                    return <Icon size={20} style={{ color: categoryColors[selectedTool.category] }} />
                  })()}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#cdd6f4]">{selectedTool.name}</h2>
                  <p className="text-sm text-[#a6adc8]">{selectedTool.description}</p>
                </div>
              </div>
            </header>

            {/* Tool Execution */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-3xl mx-auto space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#a6adc8] mb-2">
                    Input (JSON format)
                  </label>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder='{"key": "value"}'
                    className="w-full h-32 bg-[#313244] text-[#cdd6f4] placeholder-[#6c7086] px-4 py-3 rounded-xl font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#cba6f7]"
                  />
                </div>

                <button
                  onClick={executeTool}
                  disabled={!input.trim() || executing}
                  className="flex items-center gap-2 px-4 py-2 bg-[#a6e3a1] hover:bg-[#94e2d5] disabled:bg-[#45475a] disabled:cursor-not-allowed text-[#1e1e2e] rounded-lg transition-colors"
                >
                  {executing ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Play size={18} />
                  )}
                  <span>{executing ? 'Executing...' : 'Execute'}</span>
                </button>

                {output && (
                  <div>
                    <label className="block text-sm font-medium text-[#a6adc8] mb-2">
                      Output
                    </label>
                    <pre className="bg-[#11111b] text-[#cdd6f4] p-4 rounded-xl font-mono text-sm overflow-x-auto">
                      {output}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-[#a6adc8]">
            <div className="text-center">
              <Terminal size={48} className="mx-auto mb-4 text-[#cba6f7]" />
              <p className="text-lg">Select a tool</p>
              <p className="text-sm">Choose a tool from the sidebar to execute</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}