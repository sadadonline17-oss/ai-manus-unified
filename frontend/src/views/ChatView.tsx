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
      <header className="px-6 py-4 border-b border-border bg-bg-secondary">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text-primary">AI Chat</h1>
            <p className="text-sm text-text-muted font-arabic">المحادثة الذكية</p>
          </div>
          
          {/* Provider Selector */}
          <div className="relative">
            <button
              onClick={() => setShowProviderDropdown(!showProviderDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-bg-elevated hover:bg-bg-tertiary border border-border rounded-lg transition-colors"
            >
              <div className={`w-2 h-2 rounded-full ${selectedProviderData?.available ? 'bg-accent-success' : 'bg-accent-error'}`}></div>
              <span className="text-text-primary">{selectedProviderData?.displayName || selectedProvider}</span>
              <ChevronDown size={16} className="text-text-muted" />
            </button>
            
            {showProviderDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-bg-secondary border border-border rounded-lg shadow-xl z-50">
                {providers.map((provider) => (
                  <button
                    key={provider.name}
                    onClick={() => {
                      setSelectedProvider(provider.name)
                      setShowProviderDropdown(false)
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-2 hover:bg-bg-elevated transition-colors first:rounded-t-lg last:rounded-b-lg ${
                      selectedProvider === provider.name ? 'bg-bg-elevated text-brand-eagle' : 'text-text-primary'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${provider.available ? 'bg-accent-success' : 'bg-accent-error'}`}></div>
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
          <div className="flex flex-col items-center justify-center h-full text-text-muted">
            <Bot size={48} className="mb-4 text-brand-eagle" />
            <p className="text-lg">Start a conversation</p>
            <p className="text-sm font-arabic">ابدأ المحادثة</p>
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
              <div className="w-8 h-8 rounded-lg bg-brand-eagle flex items-center justify-center flex-shrink-0">
                <Bot size={18} className="text-bg-primary" />
              </div>
            )}
            
            <div
              className={`max-w-[70%] px-4 py-3 rounded-xl ${
                message.role === 'user'
                  ? 'bg-brand-eagle text-bg-primary'
                  : 'bg-bg-elevated text-text-primary border border-border'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-bg-secondary' : 'text-text-muted'}`}>
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>

            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-bg-elevated flex items-center justify-center flex-shrink-0 border border-border">
                <User size={18} className="text-brand-eagle" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 message-fade-in">
            <div className="w-8 h-8 rounded-lg bg-brand-eagle flex items-center justify-center flex-shrink-0">
              <Bot size={18} className="text-bg-primary" />
            </div>
            <div className="bg-bg-elevated px-4 py-3 rounded-xl border border-border">
              <div className="flex items-center gap-2 text-text-muted">
                <Loader2 size={16} className="animate-spin" />
                <span>Thinking...</span>
                <span className="font-arabic text-sm">جاري التفكير...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-bg-secondary">
        <div className="flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... / اكتب رسالتك..."
            rows={1}
            className="flex-1 bg-bg-elevated text-text-primary placeholder-text-muted px-4 py-3 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-brand-eagle border border-border transition-all"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="px-4 py-3 bg-brand-eagle hover:bg-accent-primaryHover disabled:bg-bg-elevated disabled:cursor-not-allowed text-bg-primary rounded-xl transition-colors flex items-center gap-2 disabled:border disabled:border-border"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}