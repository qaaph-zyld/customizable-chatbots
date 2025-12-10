import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Key, Webhook, Plug, Copy, Plus, Trash2 } from 'lucide-react'
import { useAuthStore } from '../lib/store'
import api from '../lib/api'

export default function Settings() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'profile' | 'api-keys' | 'webhooks' | 'integrations'>('profile')
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [webhooks, setWebhooks] = useState<any[]>([])
  const [integrations, setIntegrations] = useState<any[]>([])
  const [showNewApiKeyModal, setShowNewApiKeyModal] = useState(false)
  const [newApiKey, setNewApiKey] = useState<string | null>(null)

  useEffect(() => {
    if (activeTab === 'api-keys') fetchApiKeys()
    if (activeTab === 'webhooks') fetchWebhooks()
    if (activeTab === 'integrations') fetchIntegrations()
  }, [activeTab])

  const fetchApiKeys = async () => {
    try {
      const res = await api.get('/auth/api-keys')
      setApiKeys(res.data)
    } catch (e) {
      console.error('Failed to fetch API keys')
    }
  }

  const fetchWebhooks = async () => {
    try {
      const res = await api.get('/webhooks')
      setWebhooks(res.data)
    } catch (e) {
      console.error('Failed to fetch webhooks')
    }
  }

  const fetchIntegrations = async () => {
    try {
      const res = await api.get('/integrations')
      setIntegrations(res.data)
    } catch (e) {
      console.error('Failed to fetch integrations')
    }
  }

  const createApiKey = async (name: string) => {
    try {
      const res = await api.post('/auth/api-keys', { name })
      setNewApiKey(res.data.key)
      fetchApiKeys()
    } catch (e) {
      console.error('Failed to create API key')
    }
  }

  const deleteApiKey = async (id: string) => {
    if (!confirm('Delete this API key?')) return
    try {
      await api.delete(`/auth/api-keys/${id}`)
      fetchApiKeys()
    } catch (e) {
      console.error('Failed to delete API key')
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: SettingsIcon },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'integrations', label: 'Integrations', icon: Plug }
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your account and integrations</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-6">Profile Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    defaultValue={user?.full_name || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    defaultValue={user?.company_name || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* API Keys Tab */}
          {activeTab === 'api-keys' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold">API Keys</h2>
                  <p className="text-sm text-gray-500">Manage your API keys for external integrations</p>
                </div>
                <button
                  onClick={() => setShowNewApiKeyModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4" />
                  Create Key
                </button>
              </div>

              {newApiKey && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 mb-2 font-medium">New API key created! Copy it now - it won't be shown again.</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-white rounded text-sm font-mono">{newApiKey}</code>
                    <button
                      onClick={() => navigator.clipboard.writeText(newApiKey)}
                      className="p-2 text-green-600 hover:bg-green-100 rounded"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">{key.name}</p>
                      <p className="text-sm text-gray-500 font-mono">{key.key_prefix}...</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {key.last_used_at ? `Last used ${new Date(key.last_used_at).toLocaleDateString()}` : 'Never used'}
                      </span>
                      <button
                        onClick={() => deleteApiKey(key.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {apiKeys.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No API keys yet</p>
                )}
              </div>
            </div>
          )}

          {/* Webhooks Tab */}
          {activeTab === 'webhooks' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold">Webhooks</h2>
                  <p className="text-sm text-gray-500">Receive notifications when events occur</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  <Plus className="w-4 h-4" />
                  Add Webhook
                </button>
              </div>

              <div className="space-y-3">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{webhook.name}</p>
                      <span className={`px-2 py-0.5 rounded text-xs ${webhook.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {webhook.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 font-mono truncate">{webhook.url}</p>
                    <div className="flex gap-1 mt-2">
                      {webhook.events?.slice(0, 3).map((event: string) => (
                        <span key={event} className="px-2 py-0.5 bg-gray-100 rounded text-xs">{event}</span>
                      ))}
                    </div>
                  </div>
                ))}
                {webhooks.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No webhooks configured</p>
                )}
              </div>
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold mb-4">Available Integrations</h2>
                <div className="grid grid-cols-2 gap-4">
                  <IntegrationCard
                    name="Slack"
                    description="Send chatbot responses to Slack channels"
                    icon="💬"
                    connected={integrations.some(i => i.type === 'slack' && i.is_active)}
                  />
                  <IntegrationCard
                    name="WhatsApp"
                    description="Connect via Twilio WhatsApp Business"
                    icon="📱"
                    connected={integrations.some(i => i.type === 'twilio' && i.is_active)}
                  />
                  <IntegrationCard
                    name="Messenger"
                    description="Facebook Messenger integration"
                    icon="💭"
                    connected={integrations.some(i => i.type === 'messenger' && i.is_active)}
                  />
                  <IntegrationCard
                    name="Zapier"
                    description="Connect to 5000+ apps"
                    icon="⚡"
                    connected={integrations.some(i => i.type === 'zapier' && i.is_active)}
                  />
                </div>
              </div>

              {integrations.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold mb-4">Active Integrations</h2>
                  <div className="space-y-3">
                    {integrations.map((integration) => (
                      <div key={integration.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {integration.type === 'slack' ? '💬' : integration.type === 'twilio' ? '📱' : '🔌'}
                          </span>
                          <div>
                            <p className="font-medium capitalize">{integration.type}</p>
                            <p className="text-sm text-gray-500">{integration.chatbots?.name || 'All chatbots'}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs ${integration.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {integration.is_active ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* New API Key Modal */}
      {showNewApiKeyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create API Key</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const form = e.target as HTMLFormElement
              createApiKey((form.elements.namedItem('name') as HTMLInputElement).value)
              setShowNewApiKeyModal(false)
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Key Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g., Production API"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewApiKeyModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function IntegrationCard({ name, description, icon, connected }: { name: string; description: string; icon: string; connected: boolean }) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors cursor-pointer">
      <div className="flex items-start justify-between">
        <span className="text-3xl">{icon}</span>
        {connected && (
          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Connected</span>
        )}
      </div>
      <h3 className="font-medium mt-3">{name}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
      <button className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
        {connected ? 'Configure →' : 'Connect →'}
      </button>
    </div>
  )
}
