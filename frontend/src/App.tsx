import { useState } from 'react'
import { MessageSquare, Workflow, Settings, Wrench, Menu, X } from 'lucide-react'
import ChatView from './views/ChatView'
import WorkflowView from './views/WorkflowView'
import ToolsView from './views/ToolsView'
import SettingsView from './views/SettingsView'

type View = 'chat' | 'workflow' | 'tools' | 'settings'

function App() {
  const [currentView, setCurrentView] = useState<View>('chat')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems = [
    { id: 'chat' as View, label: 'Chat', icon: MessageSquare },
    { id: 'workflow' as View, label: 'Workflows', icon: Workflow },
    { id: 'tools' as View, label: 'Tools', icon: Wrench },
    { id: 'settings' as View, label: 'Settings', icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-[#1e1e2e] text-[#cdd6f4]">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-[#181825] border-r border-[#313244] transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-[#313244] flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#cba6f7] to-[#89b4fa] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="font-semibold text-[#cdd6f4]">Manus Unified</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-[#313244] rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-1 ${
                currentView === item.id
                  ? 'bg-[#313244] text-[#cba6f7]'
                  : 'text-[#a6adc8] hover:bg-[#313244] hover:text-[#cdd6f4]'
              }`}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Status */}
        {sidebarOpen && (
          <div className="p-4 border-t border-[#313244]">
            <div className="flex items-center gap-2 text-sm text-[#a6adc8]">
              <div className="w-2 h-2 bg-[#a6e3a1] rounded-full animate-pulse"></div>
              <span>Server Connected</span>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {currentView === 'chat' && <ChatView />}
        {currentView === 'workflow' && <WorkflowView />}
        {currentView === 'tools' && <ToolsView />}
        {currentView === 'settings' && <SettingsView />}
      </main>
    </div>
  )
}

export default App