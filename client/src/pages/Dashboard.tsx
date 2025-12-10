import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, MessageSquare, TrendingUp, ArrowRight } from 'lucide-react'
import { analyticsApi, chatbotsApi } from '../lib/api'

interface OverviewData {
  totalChatbots: number
  activeChatbots: number
  totalConversations: number
  totalMessages: number
  avgResponseTime: number
  satisfactionRate: number
}

export default function Dashboard() {
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [chatbots, setChatbots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, chatbotsRes] = await Promise.all([
          analyticsApi.getOverview(),
          chatbotsApi.getAll()
        ])
        setOverview(overviewRes.data)
        setChatbots(chatbotsRes.data)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const stats = [
    { label: 'Total Chatbots', value: overview?.totalChatbots || 0, icon: Bot, color: 'bg-blue-500' },
    { label: 'Active Chatbots', value: overview?.activeChatbots || 0, icon: Bot, color: 'bg-green-500' },
    { label: 'Conversations', value: overview?.totalConversations || 0, icon: MessageSquare, color: 'bg-purple-500' },
    { label: 'Satisfaction Rate', value: `${overview?.satisfactionRate || 0}%`, icon: TrendingUp, color: 'bg-orange-500' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome to your chatbot platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Chatbots */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Your Chatbots</h2>
          <Link to="/chatbots" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {chatbots.slice(0, 5).map((chatbot) => (
            <Link
              key={chatbot.id}
              to={`/chatbots/${chatbot.id}`}
              className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{chatbot.name}</p>
                  <p className="text-sm text-gray-500">{chatbot.description}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                chatbot.status === 'active' 
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {chatbot.status}
              </span>
            </Link>
          ))}
          {chatbots.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No chatbots yet. <Link to="/chatbots" className="text-indigo-600">Create one</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
