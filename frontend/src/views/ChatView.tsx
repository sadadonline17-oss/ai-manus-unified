import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, ChevronDown } from 'lucide-react'
import axios from 'axios'

const API_URL = 'http://localhost:8000'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

interface Provider {
  name: string
  displayName: string
  available: boolean
}

export default function ChatView() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [providers, setProviders] = useState<Provider[]>([])
  const [selectedProvider, setSelectedProvider] = useState<string>('openai')
  const [showProviderDropdown, setShowProviderDropdown] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetchProviders()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchProviders = async () => {
    try {
      const response = await axios.get(`${API_URL}/providers`)
      setProviders(response.data.providers)
    } catch (error) {
      console.error('Failed to fetch providers:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await axios.post(`${API_URL}/chat`, {
        messages: [
          { role: 'user', content: userMessage.content }
        ],
        provider: selectedProvider,
      })

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.data || response.data.message || 'No response',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error: any) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error.response?.data?.error || error.message || 'Failed to get response'}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const selectedProviderData = providers.find(p => p.name === selectedProvider)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="px-6 py-4 border-b border-[#313244] bg-[#181825]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#cdd6f4]">AI Chat</h1>
            <p className="text-sm text-[#a6adc8]">Chat with AI providers</p>
          </div>
          
          {/* Provider Selector */}
          <div className="relative">
            <button
              onClick={() => setShowProviderDropdown(!showProviderDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-[#313244] hover:bg-[#45475a] rounded-lg transition-colors"
            >
              <div className={`w-2 h-2 rounded-full ${selectedProviderData?.available ? 'bg-[#a6e3a1]' : 'bg-[#f38ba8]'}`}></div>
              <span className="text-[#cdd6f4]">{selectedProviderData?.displayName || selectedProvider}</span>
              <ChevronDown size={16} className="text-[#a6adc8]" />
            </button>
            
            {showProviderDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-[#181825] border border-[#313244] rounded-lg shadow-xl z-50">
                {providers.map((provider) => (
                  <button
                    key={provider.name}
                    onClick={() => {
                      setSelectedProvider(provider.name)
                      setShowProviderDropdown(false)
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-2 hover:bg-[#313244] transition-colors first:rounded-t-lg last:rounded-b-lg ${
                      selectedProvider === provider.name ? 'bg-[#313244] text-[#cba6f7]' : 'text-[#cdd6f4]'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${provider.available ? 'bg-[#a6e3a1]' : 'bg-[#f38ba8]'}`}></div>
                    <span>{provider.displayName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-[#a6adc8]">
            <Bot size={48} className="mb-4 text-[#cba6f7]" />
            <p className="text-lg">Start a conversation</p>
            <p className="text-sm">Send a message to begin chatting with AI</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 message-fade-in ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#cba6f7] to-[#89b4fa] flex items-center justify-center flex-shrink-0">
                <Bot size={18} className="text-white" />
              </div>
            )}
            
            <div
              className={`max-w-[70%] px-4 py-3 rounded-xl ${
                message.role === 'user'
                  ? 'bg-[#cba6f7] text-[#1e1e2e]'
                  : 'bg-[#313244] text-[#cdd6f4]'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-[#45475a]' : 'text-[#6c7086]'}`}>
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>

            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-[#45475a] flex items-center justify-center flex-shrink-0">
                <User size={18} className="text-[#cdd6f4]" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 message-fade-in">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#cba6f7] to-[#89b4fa] flex items-center justify-center flex-shrink-0">
              <Bot size={18} className="text-white" />
            </div>
            <div className="bg-[#313244] px-4 py-3 rounded-xl">
              <div className="flex items-center gap-2 text-[#a6adc8]">
                <Loader2 size={16} className="animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#313244] bg-[#181825]">
        <div className="flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 bg-[#313244] text-[#cdd6f4] placeholder-[#6c7086] px-4 py-3 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#cba6f7] transition-all"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="px-4 py-3 bg-[#cba6f7] hover:bg-[#b4befe] disabled:bg-[#45475a] disabled:cursor-not-allowed text-[#1e1e2e] rounded-xl transition-colors flex items-center gap-2"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}