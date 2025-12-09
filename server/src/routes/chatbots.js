const express = require('express');
const router = express.Router();
const store = require('../data/store');

// GET all chatbots
router.get('/', (req, res) => {
  const chatbots = store.getAllChatbots();
  res.json(chatbots);
});

// GET chatbot by ID
router.get('/:id', (req, res) => {
  const chatbot = store.getChatbotById(req.params.id);
  if (!chatbot) {
    return res.status(404).json({ error: 'Chatbot not found' });
  }
  res.json(chatbot);
});

// POST create chatbot
router.post('/', (req, res) => {
  const { name, description, templateId, settings } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const chatbot = store.createChatbot({
    name,
    description: description || '',
    templateId: templateId || null,
    settings: settings || {
      welcomeMessage: 'Hello! How can I help you?',
      fallbackMessage: 'I\'m not sure I understand.',
      language: 'en'
    }
  });

  res.status(201).json(chatbot);
});

// PUT update chatbot
router.put('/:id', (req, res) => {
  const chatbot = store.updateChatbot(req.params.id, req.body);
  if (!chatbot) {
    return res.status(404).json({ error: 'Chatbot not found' });
  }
  res.json(chatbot);
});

// DELETE chatbot
router.delete('/:id', (req, res) => {
  const success = store.deleteChatbot(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Chatbot not found' });
  }
  res.status(204).send();
});

// POST toggle chatbot status
router.post('/:id/toggle-status', (req, res) => {
  const chatbot = store.getChatbotById(req.params.id);
  if (!chatbot) {
    return res.status(404).json({ error: 'Chatbot not found' });
  }
  
  const updated = store.updateChatbot(req.params.id, {
    status: chatbot.status === 'active' ? 'inactive' : 'active'
  });
  
  res.json(updated);
});

module.exports = router;
