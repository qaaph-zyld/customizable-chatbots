// In-memory data store for MVP
// Can be replaced with MongoDB later

const { v4: uuidv4 } = require('uuid');

// Seed data
const chatbots = [
  {
    id: 'cb-1',
    name: 'Customer Support Bot',
    description: 'Handles customer inquiries and support tickets',
    templateId: 'tpl-1',
    status: 'active',
    settings: {
      welcomeMessage: 'Hello! How can I help you today?',
      fallbackMessage: 'I\'m not sure I understand. Let me connect you with a human agent.',
      language: 'en'
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-12-01T14:30:00Z'
  },
  {
    id: 'cb-2',
    name: 'Sales Assistant',
    description: 'Helps customers find products and make purchases',
    templateId: 'tpl-2',
    status: 'active',
    settings: {
      welcomeMessage: 'Welcome! Looking for something special today?',
      fallbackMessage: 'Let me find a sales representative for you.',
      language: 'en'
    },
    createdAt: '2024-02-20T09:00:00Z',
    updatedAt: '2024-11-28T11:15:00Z'
  },
  {
    id: 'cb-3',
    name: 'FAQ Bot',
    description: 'Answers frequently asked questions',
    templateId: 'tpl-3',
    status: 'inactive',
    settings: {
      welcomeMessage: 'Hi! I can answer your questions about our service.',
      fallbackMessage: 'I don\'t have an answer for that. Please contact support.',
      language: 'en'
    },
    createdAt: '2024-03-10T08:00:00Z',
    updatedAt: '2024-10-15T16:45:00Z'
  }
];

const templates = [
  {
    id: 'tpl-1',
    name: 'Customer Support',
    description: 'Template for customer support chatbots',
    category: 'support',
    intents: ['greeting', 'help', 'complaint', 'feedback', 'goodbye'],
    responses: {
      greeting: ['Hello!', 'Hi there!', 'Welcome!'],
      help: ['How can I assist you?', 'What do you need help with?'],
      complaint: ['I\'m sorry to hear that. Let me help you resolve this.'],
      feedback: ['Thank you for your feedback!'],
      goodbye: ['Goodbye!', 'Have a great day!']
    },
    usageCount: 156,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-11-01T00:00:00Z'
  },
  {
    id: 'tpl-2',
    name: 'Sales & E-commerce',
    description: 'Template for sales and e-commerce chatbots',
    category: 'sales',
    intents: ['greeting', 'product_inquiry', 'pricing', 'checkout', 'goodbye'],
    responses: {
      greeting: ['Welcome to our store!', 'Hi! Looking for something?'],
      product_inquiry: ['Let me help you find what you need.'],
      pricing: ['Here are our current prices and offers.'],
      checkout: ['Ready to checkout? Let me guide you.'],
      goodbye: ['Thanks for shopping with us!']
    },
    usageCount: 89,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-10-20T00:00:00Z'
  },
  {
    id: 'tpl-3',
    name: 'FAQ Assistant',
    description: 'Template for FAQ and knowledge base chatbots',
    category: 'faq',
    intents: ['greeting', 'question', 'clarification', 'goodbye'],
    responses: {
      greeting: ['Hello! What would you like to know?'],
      question: ['Let me find the answer for you.'],
      clarification: ['Could you please provide more details?'],
      goodbye: ['Hope I was helpful!']
    },
    usageCount: 234,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-11-15T00:00:00Z'
  }
];

const conversations = [
  {
    id: 'conv-1',
    chatbotId: 'cb-1',
    sessionId: 'sess-001',
    userId: 'user-123',
    messages: [
      { role: 'bot', content: 'Hello! How can I help you today?', timestamp: '2024-12-01T10:00:00Z' },
      { role: 'user', content: 'I have a problem with my order', timestamp: '2024-12-01T10:00:15Z' },
      { role: 'bot', content: 'I\'m sorry to hear that. Can you provide your order number?', timestamp: '2024-12-01T10:00:16Z' },
      { role: 'user', content: 'Order #12345', timestamp: '2024-12-01T10:00:30Z' },
      { role: 'bot', content: 'Thank you. I found your order. How can I help?', timestamp: '2024-12-01T10:00:31Z' }
    ],
    status: 'resolved',
    sentiment: 'neutral',
    duration: 180,
    createdAt: '2024-12-01T10:00:00Z',
    endedAt: '2024-12-01T10:03:00Z'
  },
  {
    id: 'conv-2',
    chatbotId: 'cb-2',
    sessionId: 'sess-002',
    userId: 'user-456',
    messages: [
      { role: 'bot', content: 'Welcome! Looking for something special today?', timestamp: '2024-12-01T11:00:00Z' },
      { role: 'user', content: 'Yes, I need a laptop', timestamp: '2024-12-01T11:00:10Z' },
      { role: 'bot', content: 'Great! What\'s your budget range?', timestamp: '2024-12-01T11:00:11Z' }
    ],
    status: 'active',
    sentiment: 'positive',
    duration: 120,
    createdAt: '2024-12-01T11:00:00Z',
    endedAt: null
  }
];

// Helper to generate analytics data
function generateAnalyticsData() {
  const now = new Date();
  const last30Days = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    last30Days.push(date.toISOString().split('T')[0]);
  }

  return {
    overview: {
      totalChatbots: chatbots.length,
      activeChatbots: chatbots.filter(c => c.status === 'active').length,
      totalConversations: 1247,
      totalMessages: 8934,
      avgResponseTime: 1.2,
      satisfactionRate: 87.5,
      trends: last30Days.map((date, i) => ({
        date,
        conversations: Math.floor(30 + Math.random() * 20),
        messages: Math.floor(200 + Math.random() * 100),
        satisfaction: 80 + Math.random() * 15
      }))
    },
    conversations: {
      total: 1247,
      resolved: 1089,
      escalated: 98,
      abandoned: 60,
      avgDuration: 180,
      avgMessages: 7.2,
      byStatus: [
        { status: 'resolved', count: 1089 },
        { status: 'escalated', count: 98 },
        { status: 'abandoned', count: 60 }
      ],
      byChatbot: chatbots.map(cb => ({
        chatbotId: cb.id,
        chatbotName: cb.name,
        count: Math.floor(200 + Math.random() * 300)
      })),
      trends: last30Days.map(date => ({
        date,
        total: Math.floor(35 + Math.random() * 15),
        resolved: Math.floor(30 + Math.random() * 10),
        escalated: Math.floor(2 + Math.random() * 5)
      }))
    },
    templates: {
      total: templates.length,
      byCategory: [
        { category: 'support', count: 1 },
        { category: 'sales', count: 1 },
        { category: 'faq', count: 1 }
      ],
      usage: templates.map(t => ({
        templateId: t.id,
        templateName: t.name,
        usageCount: t.usageCount,
        category: t.category
      })),
      topPerformers: templates
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 5)
        .map(t => ({ id: t.id, name: t.name, usageCount: t.usageCount }))
    },
    userEngagement: {
      totalUsers: 892,
      activeUsers: 234,
      newUsers: 67,
      returningUsers: 167,
      avgSessionDuration: 240,
      avgMessagesPerSession: 6.8,
      retentionRate: 72.5,
      byDay: last30Days.map(date => ({
        date,
        totalUsers: Math.floor(25 + Math.random() * 15),
        newUsers: Math.floor(5 + Math.random() * 8),
        sessions: Math.floor(40 + Math.random() * 20)
      })),
      byHour: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        users: Math.floor(10 + Math.sin(hour / 24 * Math.PI * 2) * 20 + Math.random() * 10)
      }))
    },
    responseQuality: {
      avgResponseTime: 1.2,
      avgFirstResponseTime: 0.8,
      sentimentBreakdown: [
        { sentiment: 'positive', percentage: 45 },
        { sentiment: 'neutral', percentage: 40 },
        { sentiment: 'negative', percentage: 15 }
      ],
      qualityScore: 8.4,
      resolutionRate: 87.3,
      escalationRate: 7.9,
      trends: last30Days.map(date => ({
        date,
        responseTime: 1.0 + Math.random() * 0.5,
        qualityScore: 8.0 + Math.random() * 1.0,
        satisfaction: 85 + Math.random() * 10
      }))
    }
  };
}

// Store instance
const store = {
  chatbots: [...chatbots],
  templates: [...templates],
  conversations: [...conversations],
  analytics: generateAnalyticsData(),

  // Chatbot methods
  getAllChatbots() {
    return this.chatbots;
  },
  getChatbotById(id) {
    return this.chatbots.find(c => c.id === id);
  },
  createChatbot(data) {
    const chatbot = {
      id: `cb-${uuidv4().slice(0, 8)}`,
      ...data,
      status: data.status || 'inactive',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.chatbots.push(chatbot);
    return chatbot;
  },
  updateChatbot(id, data) {
    const index = this.chatbots.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.chatbots[index] = {
      ...this.chatbots[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    return this.chatbots[index];
  },
  deleteChatbot(id) {
    const index = this.chatbots.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.chatbots.splice(index, 1);
    return true;
  },

  // Template methods
  getAllTemplates() {
    return this.templates;
  },
  getTemplateById(id) {
    return this.templates.find(t => t.id === id);
  },
  createTemplate(data) {
    const template = {
      id: `tpl-${uuidv4().slice(0, 8)}`,
      ...data,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.templates.push(template);
    return template;
  },
  updateTemplate(id, data) {
    const index = this.templates.findIndex(t => t.id === id);
    if (index === -1) return null;
    this.templates[index] = {
      ...this.templates[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    return this.templates[index];
  },
  deleteTemplate(id) {
    const index = this.templates.findIndex(t => t.id === id);
    if (index === -1) return false;
    this.templates.splice(index, 1);
    return true;
  },

  // Conversation methods
  getAllConversations() {
    return this.conversations;
  },
  getConversationById(id) {
    return this.conversations.find(c => c.id === id);
  },
  getConversationsByChatbot(chatbotId) {
    return this.conversations.filter(c => c.chatbotId === chatbotId);
  },
  createConversation(data) {
    const conversation = {
      id: `conv-${uuidv4().slice(0, 8)}`,
      ...data,
      messages: data.messages || [],
      status: 'active',
      createdAt: new Date().toISOString(),
      endedAt: null
    };
    this.conversations.push(conversation);
    return conversation;
  },
  addMessage(conversationId, message) {
    const conv = this.getConversationById(conversationId);
    if (!conv) return null;
    conv.messages.push({
      ...message,
      timestamp: new Date().toISOString()
    });
    return conv;
  },

  // Analytics methods
  getAnalytics(type) {
    if (type && this.analytics[type]) {
      return this.analytics[type];
    }
    return this.analytics;
  }
};

module.exports = store;
