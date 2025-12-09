const express = require('express');
const router = express.Router();
const store = require('../data/store');

// GET all templates
router.get('/', (req, res) => {
  const templates = store.getAllTemplates();
  res.json(templates);
});

// GET template by ID
router.get('/:id', (req, res) => {
  const template = store.getTemplateById(req.params.id);
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }
  res.json(template);
});

// POST create template
router.post('/', (req, res) => {
  const { name, description, category, intents, responses } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const template = store.createTemplate({
    name,
    description: description || '',
    category: category || 'general',
    intents: intents || [],
    responses: responses || {}
  });

  res.status(201).json(template);
});

// PUT update template
router.put('/:id', (req, res) => {
  const template = store.updateTemplate(req.params.id, req.body);
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }
  res.json(template);
});

// DELETE template
router.delete('/:id', (req, res) => {
  const success = store.deleteTemplate(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Template not found' });
  }
  res.status(204).send();
});

module.exports = router;
