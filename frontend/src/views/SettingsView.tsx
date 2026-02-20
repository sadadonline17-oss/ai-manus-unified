import { useState, useEffect } from 'react'
import { Save, Check, Loader2, Globe, Cpu, Key, ExternalLink } from 'lucide-react'
import axios from 'axios'

const API_URL = '/api'

interface Provider {
  name: string
  displayName: string
  available: boolean
  type: 'cloud' | 'local'
  description?: string
}

interface Stats {
  providers: {
    totalProviders: number
    availableProviders: number
  }
  tools: {
    totalTools: number
  }
  orchestrator: {
    healthyProviders: number
  }
}

export default function SettingsView() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'providers'>('general')
  const [providerType, setProviderType] = useState<'cloud' | 'local'>('cloud')
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({})

  // Settings state
  const [settings, setSettings] = useState({
    defaultProvider: 'openai',
    temperature: 0.7,
    maxTokens: 4096,
    theme: 'dark',
    language: 'en',
  })

  useEffect(() => {
    fetchData()
    loadApiKeys()
  }, [])

  const loadApiKeys = () => {
    const keys: Record<string, string> = {}
    providers.forEach(p => {
      const key = localStorage.getItem(`api_key_${p.name}`)
      if (key) keys[p.name] = key
    })
    setApiKeys(keys)
  }

  useEffect(() => {
    if (providers.length > 0) loadApiKeys()
  }, [providers])

  const fetchData = async () => {
    try {
      const [providersRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/providers`),
        axios.get(`${API_URL}/stats`),
      ])
      setProviders(providersRes.data.providers)
      setStats(statsRes.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    // Save API keys to localStorage
    Object.entries(apiKeys).forEach(([name, key]) => {
      localStorage.setItem(`api_key_${name}`, key)
    })
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleApiKeyChange = (providerName: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [providerName]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={32} className="animate-spin text-brand-eagle" />
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-6">
          <div className="flex items-center gap-8">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
              <p className="text-sm text-text-muted font-arabic">الإعدادات</p>
            </div>

            <nav className="flex gap-4">
              <button
                onClick={() => setActiveTab('general')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'general' ? 'bg-bg-elevated text-brand-eagle border border-border' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                General
              </button>
              <button
                onClick={() => setActiveTab('providers')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'providers' ? 'bg-bg-elevated text-brand-eagle border border-border' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Providers
              </button>
            </nav>
          </div>

          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-brand-eagle hover:bg-accent-primaryHover disabled:bg-bg-elevated text-bg-primary rounded-lg transition-colors disabled:border disabled:border-border"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : saved ? (
              <Check size={18} />
            ) : (
              <Save size={18} />
            )}
            <span>{saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}</span>
          </button>
        </div>

        {activeTab === 'general' ? (
          <div className="space-y-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-bg-secondary border border-border rounded-xl p-4">
              <p className="text-sm text-text-muted">Providers</p>
              <p className="text-sm text-text-muted font-arabic">المزودين</p>
              <p className="text-2xl font-bold text-brand-eagle">
                {stats.providers.availableProviders}/{stats.providers.totalProviders}
              </p>
              <p className="text-xs text-text-muted">Available</p>
            </div>
            <div className="bg-bg-secondary border border-border rounded-xl p-4">
              <p className="text-sm text-text-muted">Tools</p>
              <p className="text-sm text-text-muted font-arabic">الأدوات</p>
              <p className="text-2xl font-bold text-accent-secondary">{stats.tools.totalTools}</p>
              <p className="text-xs text-text-muted">Registered</p>
            </div>
            <div className="bg-bg-secondary border border-border rounded-xl p-4">
              <p className="text-sm text-text-muted">Health</p>
              <p className="text-sm text-text-muted font-arabic">الصحة</p>
              <p className="text-2xl font-bold text-accent-success">{stats.orchestrator.healthyProviders}</p>
              <p className="text-xs text-text-muted">Healthy Providers</p>
            </div>
          </div>
        )}


          {/* AI Settings */}
        <div className="bg-bg-secondary border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-2">AI Settings</h2>
          <p className="text-sm text-text-muted font-arabic mb-4">إعدادات الذكاء الاصطناعي</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Default Provider
              </label>
              <select
                value={settings.defaultProvider}
                onChange={(e) => setSettings({ ...settings, defaultProvider: e.target.value })}
                className="w-full bg-bg-elevated text-text-primary px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-brand-eagle"
              >
                {providers.map((provider) => (
                  <option key={provider.name} value={provider.name}>
                    {provider.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Temperature: {settings.temperature}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={settings.temperature}
                onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                className="w-full accent-brand-eagle"
              />
              <div className="flex justify-between text-xs text-text-muted">
                <span>Precise</span>
                <span>Creative</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Max Tokens
              </label>
              <input
                type="number"
                value={settings.maxTokens}
                onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) })}
                className="w-full bg-bg-elevated text-text-primary px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-brand-eagle"
              />
            </div>
          </div>
        </div>

          {/* Appearance */}
        <div className="bg-bg-secondary border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-2">Appearance</h2>
          <p className="text-sm text-text-muted font-arabic mb-4">المظهر</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Theme
              </label>
              <select
                value={settings.theme}
                onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                className="w-full bg-bg-elevated text-text-primary px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-brand-eagle"
              >
                <option value="dark">Dark (Syrian Theme)</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Language / اللغة
              </label>
              <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="w-full bg-bg-elevated text-text-primary px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-brand-eagle"
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </div>
        </div>

          </div>
        ) : (
          <div className="space-y-6">
            {/* Provider Tabs */}
            <div className="flex gap-2 p-1 bg-bg-secondary border border-border rounded-xl w-fit">
              <button
                onClick={() => setProviderType('cloud')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  providerType === 'cloud' ? 'bg-bg-elevated text-brand-eagle shadow-sm' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <Globe size={18} />
                <span>Cloud Providers</span>
              </button>
              <button
                onClick={() => setProviderType('local')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  providerType === 'local' ? 'bg-bg-elevated text-brand-eagle shadow-sm' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <Cpu size={18} />
                <span>Local Providers</span>
              </button>
            </div>

            {/* Provider Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {providers
                .filter(p => p.type === providerType)
                .map(provider => (
                  <div key={provider.name} className="bg-bg-secondary border border-border rounded-xl p-5 hover:border-brand-eagle/50 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-bg-elevated flex items-center justify-center border border-border group-hover:border-brand-eagle/30 transition-colors">
                          {provider.type === 'cloud' ? <Globe className="text-accent-secondary" /> : <Cpu className="text-accent-success" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-text-primary">{provider.displayName}</h3>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${provider.available ? 'bg-accent-success' : 'bg-accent-error'}`} />
                            <span className="text-[10px] text-text-muted uppercase tracking-wider">{provider.available ? 'Available' : 'Unavailable'}</span>
                          </div>
                        </div>
                      </div>
                      <button className="text-text-muted hover:text-brand-eagle transition-colors">
                        <ExternalLink size={16} />
                      </button>
                    </div>

                    <p className="text-sm text-text-muted mb-4 min-h-[40px]">
                      {provider.description || `Integration for ${provider.displayName} models.`}
                    </p>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-medium text-text-secondary">
                        <Key size={12} />
                        <span>{provider.type === 'cloud' ? 'API Key' : 'Base URL'}</span>
                      </label>
                      <input
                        type="password"
                        value={apiKeys[provider.name] || ''}
                        onChange={(e) => handleApiKeyChange(provider.name, e.target.value)}
                        placeholder={provider.type === 'cloud' ? `Enter ${provider.displayName} API Key` : 'http://localhost:11434'}
                        className="w-full bg-bg-elevated text-text-primary px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-brand-eagle text-sm"
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}