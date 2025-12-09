import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Chatbots from './pages/Chatbots'
import ChatbotDetail from './pages/ChatbotDetail'
import Templates from './pages/Templates'
import Analytics from './pages/Analytics'
import ChatWidget from './pages/ChatWidget'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="chatbots" element={<Chatbots />} />
        <Route path="chatbots/:id" element={<ChatbotDetail />} />
        <Route path="templates" element={<Templates />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
      <Route path="/chat/:chatbotId" element={<ChatWidget />} />
    </Routes>
  )
}

export default App
