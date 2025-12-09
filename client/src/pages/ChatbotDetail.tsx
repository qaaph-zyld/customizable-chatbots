import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Bot, Settings, MessageSquare, ExternalLink } from 'lucide-react'
import { chatbotsApi, conversationsApi } from '../lib/api'

interface Chatbot {
  id: string
  name: string
  description: string
  templateId: string | null
  status: 'active' | 'inactive'
  settings: {
    welcomeMessage: string
    fallbackMessage: string
    language: string
  }
  createdAt: string
  updatedAt: string
}

export default function ChatbotDetail() {
  const { id } = useParams<{ id: string }>()
  const [chatbot, setChatbot] = useState<Chatbot | null>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Chatbot>>({})

  useEffect(() => {
    if (id) fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      const [chatbotRes, convsRes] = await Promise.all([
        chatbotsApi.getById(id!),
        conversationsApi.getAll(id)
      ])
      setChatbot(chatbotRes.data)
      setConversations(convsRes.data)
      setFormData(chatbotRes.data)
    } catch (error) {
      console.error('Failed to fetch chatbot:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      await chatbotsApi.update(id!, formData)
      setEditing(false)
      fetchData()
    } catch (error) {
      console.error('Failed to update chatbot:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!chatbot) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Chatbot not found</p>
        <Link to="/chatbots" className="text-indigo-600 hover:underline">Back to chatbots</Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <Link to="/chatbots" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Chatbots
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Bot className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{chatbot.name}</h1>
              <p className="text-gray-500">{chatbot.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`/chat/${chatbot.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ExternalLink className="w-4 h-4" />
              Test Chat
            </a>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              chatbot.status === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {chatbot.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Settings
            </h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{chatbot.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              {editing ? (
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              ) : (
                <p className="text-gray-900">{chatbot.description}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Message</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.settings?.welcomeMessage || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: { ...formData.settings!, welcomeMessage: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{chatbot.settings.welcomeMessage}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fallback Message</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.settings?.fallbackMessage || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: { ...formData.settings!, fallbackMessage: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{chatbot.settings.fallbackMessage}</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5" />
            Recent Conversations
          </h2>
          {conversations.length > 0 ? (
            <div className="space-y-3">
              {conversations.slice(0, 5).map((conv) => (
                <div key={conv.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">Session {conv.sessionId.slice(-6)}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      conv.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {conv.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{conv.messages?.length || 0} messages</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No conversations yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
