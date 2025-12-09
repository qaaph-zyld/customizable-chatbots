import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, Plus, Play, Pause, Trash2, ExternalLink } from 'lucide-react'
import { chatbotsApi, templatesApi } from '../lib/api'

interface Chatbot {
  id: string
  name: string
  description: string
  templateId: string | null
  status: 'active' | 'inactive'
  createdAt: string
}

interface Template {
  id: string
  name: string
}

export default function Chatbots() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '', templateId: '' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [chatbotsRes, templatesRes] = await Promise.all([
        chatbotsApi.getAll(),
        templatesApi.getAll()
      ])
      setChatbots(chatbotsRes.data)
      setTemplates(templatesRes.data)
    } catch (error) {
      console.error('Failed to fetch chatbots:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await chatbotsApi.create(formData)
      setShowModal(false)
      setFormData({ name: '', description: '', templateId: '' })
      fetchData()
    } catch (error) {
      console.error('Failed to create chatbot:', error)
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      await chatbotsApi.toggleStatus(id)
      fetchData()
    } catch (error) {
      console.error('Failed to toggle status:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this chatbot?')) return
    try {
      await chatbotsApi.delete(id)
      fetchData()
    } catch (error) {
      console.error('Failed to delete chatbot:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chatbots</h1>
          <p className="text-gray-500">Manage your chatbots</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Chatbot
        </button>
      </div>

      {/* Chatbots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chatbots.map((chatbot) => (
          <div key={chatbot.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Bot className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{chatbot.name}</h3>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      chatbot.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {chatbot.status}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{chatbot.description}</p>
              <div className="flex items-center gap-2">
                <Link
                  to={`/chatbots/${chatbot.id}`}
                  className="flex-1 text-center py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  View Details
                </Link>
                <button
                  onClick={() => handleToggleStatus(chatbot.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    chatbot.status === 'active'
                      ? 'text-orange-600 hover:bg-orange-50'
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                  title={chatbot.status === 'active' ? 'Pause' : 'Activate'}
                >
                  {chatbot.status === 'active' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <a
                  href={`/chat/${chatbot.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Test Chat"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
                <button
                  onClick={() => handleDelete(chatbot.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {chatbots.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <Bot className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No chatbots yet. Create your first one!</p>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Chatbot</h2>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
                  <select
                    value={formData.templateId}
                    onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">No template</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>{template.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
