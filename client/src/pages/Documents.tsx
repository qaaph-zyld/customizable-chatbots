import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FileText, Plus, Trash2, Upload, RefreshCw, Search, ArrowLeft, CheckCircle, Clock } from 'lucide-react'
import api from '../lib/api'

interface Document {
  id: string
  name: string
  type: string
  processed: boolean
  created_at: string
}

export default function Documents() {
  const { chatbotId } = useParams<{ chatbotId: string }>()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (chatbotId) fetchDocuments()
  }, [chatbotId])

  const fetchDocuments = async () => {
    try {
      const res = await api.get(`/documents?chatbotId=${chatbotId}`)
      setDocuments(res.data)
    } catch (e) {
      console.error('Failed to fetch documents')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    try {
      await api.post('/documents', {
        chatbotId,
        name: formData.get('name'),
        type: formData.get('type'),
        content: formData.get('content'),
        url: formData.get('url')
      })
      setShowModal(false)
      fetchDocuments()
    } catch (e) {
      console.error('Failed to create document')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return
    try {
      await api.delete(`/documents/${id}`)
      fetchDocuments()
    } catch (e) {
      console.error('Failed to delete document')
    }
  }

  const handleReprocess = async (id: string) => {
    try {
      await api.post(`/documents/${id}/process`)
      fetchDocuments()
    } catch (e) {
      console.error('Failed to reprocess document')
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      const res = await api.post('/documents/search', {
        chatbotId,
        query: searchQuery
      })
      setSearchResults(res.data)
    } catch (e) {
      console.error('Search failed')
    } finally {
      setSearching(false)
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
      <div className="mb-8">
        <Link to={`/chatbots/${chatbotId}`} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Chatbot
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
            <p className="text-gray-500">Train your chatbot with documents</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" />
            Add Document
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Search className="w-5 h-5" />
          Semantic Search
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search your knowledge base..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="mt-4 space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Results:</h3>
            {searchResults.map((result, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Similarity: {(result.similarity * 100).toFixed(1)}%</span>
                </div>
                <p className="text-sm text-gray-700">{result.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Documents ({documents.length})</h2>
        </div>

        {documents.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span className="font-medium">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs uppercase">{doc.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    {doc.processed ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Processed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-600 text-sm">
                        <Clock className="w-4 h-4" />
                        Processing
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleReprocess(doc.id)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                        title="Reprocess"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No documents yet. Add your first document to train your chatbot.</p>
          </div>
        )}
      </div>

      {/* Add Document Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Add Document</h2>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    name="type"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="text">Text</option>
                    <option value="markdown">Markdown</option>
                    <option value="url">URL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    name="content"
                    rows={6}
                    placeholder="Paste your content here..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Or URL (optional)</label>
                  <input
                    type="url"
                    name="url"
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
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
                  Add Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
