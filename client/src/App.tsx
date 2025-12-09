import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './lib/store'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Chatbots from './pages/Chatbots'
import ChatbotDetail from './pages/ChatbotDetail'
import Templates from './pages/Templates'
import Analytics from './pages/Analytics'
import ChatWidget from './pages/ChatWidget'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Settings from './pages/Settings'
import Documents from './pages/Documents'

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="chatbots" element={<Chatbots />} />
        <Route path="chatbots/:id" element={<ChatbotDetail />} />
        <Route path="chatbots/:chatbotId/documents" element={<Documents />} />
        <Route path="templates" element={<Templates />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Public chat widget */}
      <Route path="/chat/:chatbotId" element={<ChatWidget />} />
    </Routes>
  )
}

export default App
