const express = require('express');
const router = express.Router();
const store = require('../data/store');

// GET all conversations
router.get('/', (req, res) => {
  const { chatbotId } = req.query;
  
  if (chatbotId) {
    const conversations = store.getConversationsByChatbot(chatbotId);
    return res.json(conversations);
  }
  
  const conversations = store.getAllConversations();
  res.json(conversations);
});

// GET conversation by ID
router.get('/:id', (req, res) => {
  const conversation = store.getConversationById(req.params.id);
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  res.json(conversation);
});

// POST create conversation (start chat)
router.post('/', (req, res) => {
  const { chatbotId, userId, sessionId } = req.body;
  
  if (!chatbotId) {
    return res.status(400).json({ error: 'chatbotId is required' });
  }

  const chatbot = store.getChatbotById(chatbotId);
  if (!chatbot) {
    return res.status(404).json({ error: 'Chatbot not found' });
  }

  const conversation = store.createConversation({
    chatbotId,
    userId: userId || `user-${Date.now()}`,
    sessionId: sessionId || `sess-${Date.now()}`,
    sentiment: 'neutral',
    duration: 0
  });

  // Add welcome message
  const welcomeMessage = chatbot.settings?.welcomeMessage || 'Hello! How can I help you?';
  store.addMessage(conversation.id, {
    role: 'bot',
    content: welcomeMessage
  });

  res.status(201).json(store.getConversationById(conversation.id));
});

// POST add message to conversation
router.post('/:id/messages', (req, res) => {
  const { content, role } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  const conversation = store.getConversationById(req.params.id);
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  // Add user message
  store.addMessage(req.params.id, {
    role: role || 'user',
    content
  });

  // Generate simple bot response if user message
  if (role !== 'bot') {
    const chatbot = store.getChatbotById(conversation.chatbotId);
    const template = chatbot?.templateId ? store.getTemplateById(chatbot.templateId) : null;
    
    let botResponse = 'I understand. How else can I help you?';
    
    // Simple intent matching
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('hello') || lowerContent.includes('hi')) {
      botResponse = template?.responses?.greeting?.[0] || 'Hello! How can I assist you?';
    } else if (lowerContent.includes('bye') || lowerContent.includes('goodbye')) {
      botResponse = template?.responses?.goodbye?.[0] || 'Goodbye! Have a great day!';
    } else if (lowerContent.includes('help')) {
      botResponse = template?.responses?.help?.[0] || 'I\'m here to help! What do you need assistance with?';
    } else if (lowerContent.includes('thank')) {
      botResponse = 'You\'re welcome! Is there anything else I can help with?';
    }
    
    store.addMessage(req.params.id, {
      role: 'bot',
      content: botResponse
    });
  }

  res.json(store.getConversationById(req.params.id));
});

module.exports = router;
