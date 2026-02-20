import { useState, useEffect } from 'react'
import { Save, RefreshCw, Check, X, Loader2 } from 'lucide-react'
import axios from 'axios'

const API_URL = 'http://localhost:8000'

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
        <Loader2 size={32} className="animate-spin text-[#cba6f7]" />
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#cdd6f4]">Settings</h1>
            <p className="text-[#a6adc8]">Configure your AI Manus platform</p>
          </div>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#cba6f7] hover:bg-[#b4befe] disabled:bg-[#45475a] text-[#1e1e2e] rounded-lg transition-colors"
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
            <div className="bg-[#181825] border border-[#313244] rounded-xl p-4">
              <p className="text-sm text-[#a6adc8]">Providers</p>
              <p className="text-2xl font-bold text-[#cba6f7]">
                {stats.providers.availableProviders}/{stats.providers.totalProviders}
              </p>
              <p className="text-xs text-[#6c7086]">Available</p>
            </div>
            <div className="bg-[#181825] border border-[#313244] rounded-xl p-4">
              <p className="text-sm text-[#a6adc8]">Tools</p>
              <p className="text-2xl font-bold text-[#89b4fa]">{stats.tools.totalTools}</p>
              <p className="text-xs text-[#6c7086]">Registered</p>
            </div>
            <div className="bg-[#181825] border border-[#313244] rounded-xl p-4">
              <p className="text-sm text-[#a6adc8]">Health</p>
              <p className="text-2xl font-bold text-[#a6e3a1]">{stats.orchestrator.healthyProviders}</p>
              <p className="text-xs text-[#6c7086]">Healthy Providers</p>
            </div>
          </div>
        )}

        {/* Provider Status */}
        <div className="bg-[#181825] border border-[#313244] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[#cdd6f4] mb-4">Provider Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {providers.map((provider) => (
              <div
                key={provider.name}
                className="flex items-center gap-2 px-3 py-2 bg-[#1e1e2e] rounded-lg"
              >
                <div className={`w-2 h-2 rounded-full ${provider.available ? 'bg-[#a6e3a1]' : 'bg-[#f38ba8]'}`} />
                <span className="text-sm text-[#cdd6f4]">{provider.displayName}</span>
                {provider.available ? (
                  <Check size={14} className="text-[#a6e3a1] ml-auto" />
                ) : (
                  <X size={14} className="text-[#f38ba8] ml-auto" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* AI Settings */}
        <div className="bg-[#181825] border border-[#313244] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[#cdd6f4] mb-4">AI Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#a6adc8] mb-2">
                Default Provider
              </label>
              <select
                value={settings.defaultProvider}
                onChange={(e) => setSettings({ ...settings, defaultProvider: e.target.value })}
                className="w-full bg-[#1e1e2e] text-[#cdd6f4] px-4 py-2 rounded-lg border border-[#313244] focus:outline-none focus:ring-2 focus:ring-[#cba6f7]"
              >
                {providers.map((provider) => (
                  <option key={provider.name} value={provider.name}>
                    {provider.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#a6adc8] mb-2">
                Temperature: {settings.temperature}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={settings.temperature}
                onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                className="w-full accent-[#cba6f7]"
              />
              <div className="flex justify-between text-xs text-[#6c7086]">
                <span>Precise</span>
                <span>Creative</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#a6adc8] mb-2">
                Max Tokens
              </label>
              <input
                type="number"
                value={settings.maxTokens}
                onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) })}
                className="w-full bg-[#1e1e2e] text-[#cdd6f4] px-4 py-2 rounded-lg border border-[#313244] focus:outline-none focus:ring-2 focus:ring-[#cba6f7]"
              />
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-[#181825] border border-[#313244] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[#cdd6f4] mb-4">Appearance</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#a6adc8] mb-2">
                Theme
              </label>
              <select
                value={settings.theme}
                onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                className="w-full bg-[#1e1e2e] text-[#cdd6f4] px-4 py-2 rounded-lg border border-[#313244] focus:outline-none focus:ring-2 focus:ring-[#cba6f7]"
              >
                <option value="dark">Dark (Catppuccin Mocha)</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#a6adc8] mb-2">
                Language
              </label>
              <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="w-full bg-[#1e1e2e] text-[#cdd6f4] px-4 py-2 rounded-lg border border-[#313244] focus:outline-none focus:ring-2 focus:ring-[#cba6f7]"
              >
                <option value="en">English</option>
                <option value="ar">Arabic</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-[#313244] hover:bg-[#45475a] text-[#cdd6f4] rounded-lg transition-colors"
          >
            <RefreshCw size={18} />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>
  )
}