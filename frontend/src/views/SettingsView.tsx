import { useState, useEffect } from 'react'
import { Save, RefreshCw, Check, X, Loader2 } from 'lucide-react'
import axios from 'axios'

const API_URL = '/api'

interface Provider {
  name: string
  displayName: string
  available: boolean
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
  }, [])

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
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
            <p className="text-text-muted font-arabic">الإعدادات</p>
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

        {/* Provider Status */}
        <div className="bg-bg-secondary border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-2">Provider Status</h2>
          <p className="text-sm text-text-muted font-arabic mb-4">حالة المزودين</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {providers.map((provider) => (
              <div
                key={provider.name}
                className="flex items-center gap-2 px-3 py-2 bg-bg-elevated rounded-lg border border-border"
              >
                <div className={`w-2 h-2 rounded-full ${provider.available ? 'bg-accent-success' : 'bg-accent-error'}`} />
                <span className="text-sm text-text-primary">{provider.displayName}</span>
                {provider.available ? (
                  <Check size={14} className="text-accent-success ml-auto" />
                ) : (
                  <X size={14} className="text-accent-error ml-auto" />
                )}
              </div>
            ))}
          </div>
        </div>

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

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-bg-elevated hover:bg-bg-tertiary text-text-primary rounded-lg transition-colors border border-border"
          >
            <RefreshCw size={18} />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>
  )
}