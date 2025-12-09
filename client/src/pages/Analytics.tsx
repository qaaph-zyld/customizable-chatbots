import { useEffect, useState } from 'react'
import { BarChart3, MessageSquare, Users, Clock, TrendingUp } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { analyticsApi } from '../lib/api'

type TabType = 'overview' | 'conversations' | 'templates' | 'engagement' | 'quality'

export default function Analytics() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [activeTab])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      let res
      switch (activeTab) {
        case 'overview': res = await analyticsApi.getOverview(); break
        case 'conversations': res = await analyticsApi.getConversations(); break
        case 'templates': res = await analyticsApi.getTemplates(); break
        case 'engagement': res = await analyticsApi.getUserEngagement(); break
        case 'quality': res = await analyticsApi.getResponseQuality(); break
      }
      setData(res.data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'conversations', label: 'Conversations', icon: MessageSquare },
    { id: 'templates', label: 'Templates', icon: BarChart3 },
    { id: 'engagement', label: 'User Engagement', icon: Users },
    { id: 'quality', label: 'Response Quality', icon: Clock },
  ]

  const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-500">Monitor your chatbot performance</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div>
          {/* Overview Tab */}
          {activeTab === 'overview' && data && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Chatbots" value={data.totalChatbots} icon={BarChart3} color="bg-indigo-500" />
                <StatCard label="Total Conversations" value={data.totalConversations?.toLocaleString()} icon={MessageSquare} color="bg-green-500" />
                <StatCard label="Avg Response Time" value={`${data.avgResponseTime}s`} icon={Clock} color="bg-orange-500" />
                <StatCard label="Satisfaction Rate" value={`${data.satisfactionRate}%`} icon={TrendingUp} color="bg-purple-500" />
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversation Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.trends?.slice(-14)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(v) => v.slice(5)} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="conversations" stroke="#6366f1" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Conversations Tab */}
          {activeTab === 'conversations' && data && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard label="Total" value={data.total?.toLocaleString()} icon={MessageSquare} color="bg-indigo-500" />
                <StatCard label="Resolved" value={data.resolved?.toLocaleString()} icon={MessageSquare} color="bg-green-500" />
                <StatCard label="Escalated" value={data.escalated} icon={MessageSquare} color="bg-orange-500" />
                <StatCard label="Avg Duration" value={`${Math.round(data.avgDuration / 60)}m`} icon={Clock} color="bg-purple-500" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={data.byStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label>
                        {data.byStatus?.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">By Chatbot</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data.byChatbot}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="chatbotName" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && data && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="Total Templates" value={data.total} icon={BarChart3} color="bg-indigo-500" />
                <StatCard label="Categories" value={data.byCategory?.length} icon={BarChart3} color="bg-green-500" />
                <StatCard label="Most Used" value={data.topPerformers?.[0]?.name || '-'} icon={TrendingUp} color="bg-purple-500" />
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Usage</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.usage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="templateName" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="usageCount" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* User Engagement Tab */}
          {activeTab === 'engagement' && data && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard label="Total Users" value={data.totalUsers?.toLocaleString()} icon={Users} color="bg-indigo-500" />
                <StatCard label="Active Users" value={data.activeUsers} icon={Users} color="bg-green-500" />
                <StatCard label="New Users" value={data.newUsers} icon={Users} color="bg-orange-500" />
                <StatCard label="Retention Rate" value={`${data.retentionRate}%`} icon={TrendingUp} color="bg-purple-500" />
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Active Users</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.byDay?.slice(-14)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(v) => v.slice(5)} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="totalUsers" stroke="#6366f1" strokeWidth={2} name="Users" />
                    <Line type="monotone" dataKey="newUsers" stroke="#22c55e" strokeWidth={2} name="New Users" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Response Quality Tab */}
          {activeTab === 'quality' && data && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard label="Avg Response Time" value={`${data.avgResponseTime}s`} icon={Clock} color="bg-indigo-500" />
                <StatCard label="Quality Score" value={`${data.qualityScore}/10`} icon={TrendingUp} color="bg-green-500" />
                <StatCard label="Resolution Rate" value={`${data.resolutionRate}%`} icon={BarChart3} color="bg-orange-500" />
                <StatCard label="Escalation Rate" value={`${data.escalationRate}%`} icon={BarChart3} color="bg-red-500" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Breakdown</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={data.sentimentBreakdown} dataKey="percentage" nameKey="sentiment" cx="50%" cy="50%" outerRadius={80} label>
                        {data.sentimentBreakdown?.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={['#22c55e', '#6366f1', '#ef4444'][index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Trends</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={data.trends?.slice(-14)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(v) => v.slice(5)} />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="qualityScore" stroke="#6366f1" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-4">
        <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}
