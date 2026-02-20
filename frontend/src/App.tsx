import { useState } from 'react'
import { MessageSquare, Workflow, Settings, Wrench, Menu, X } from 'lucide-react'
import ChatView from './views/ChatView'
import WorkflowView from './views/WorkflowView'
import ToolsView from './views/ToolsView'
import SettingsView from './views/SettingsView'
import SyrianEagle from './assets/branding/new_syrian_eagle.svg'

type View = 'chat' | 'workflow' | 'tools' | 'settings'

function App() {
  const [currentView, setCurrentView] = useState<View>('chat')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems = [
    { id: 'chat' as View, label: 'Chat', labelAr: 'المحادثة', icon: MessageSquare },
    { id: 'workflow' as View, label: 'Workflows', labelAr: 'سير العمل', icon: Workflow },
    { id: 'tools' as View, label: 'Tools', labelAr: 'الأدوات', icon: Wrench },
    { id: 'settings' as View, label: 'Settings', labelAr: 'الإعدادات', icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-bg-primary text-text-primary syrian-shell">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} h-screen bg-bg-secondary border-r border-border transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <img src={SyrianEagle} alt="Syrian Eagle" className="w-10 h-10" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-text-primary text-sm font-arabic">AI Manus Unified v2.0</span>
                <span className="text-xs text-text-muted">Enterprise Platform</span>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-bg-elevated rounded-lg transition-colors text-text-muted hover:text-brand-eagle"
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
                  ? 'bg-bg-elevated text-brand-eagle border border-border-focus'
                  : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
              }`}
            >
              <item.icon size={20} />
              {sidebarOpen && (
                <div className="flex flex-col items-start">
                  <span className="text-sm">{item.label}</span>
                  <span className="text-xs text-text-muted font-arabic">{item.labelAr}</span>
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Status */}
        {sidebarOpen && (
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <div className="w-2 h-2 bg-accent-success rounded-full animate-pulse"></div>
              <span>Server Connected</span>
            </div>
            <div className="mt-2 text-xs text-text-muted font-arabic">
              الخادم متصل
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Top decorative border */}
        <div className="h-1 bg-gradient-to-r from-transparent via-brand-eagle to-transparent opacity-30"></div>
        
        <div className="flex-1 overflow-hidden">
          {currentView === 'chat' && <ChatView />}
          {currentView === 'workflow' && <WorkflowView />}
          {currentView === 'tools' && <ToolsView />}
          {currentView === 'settings' && <SettingsView />}
        </div>
        
        {/* Bottom decorative border */}
        <div className="h-1 bg-gradient-to-r from-transparent via-brand-eagle to-transparent opacity-30"></div>
      </main>
    </div>
  )
}

export default App