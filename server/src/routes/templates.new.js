const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { supabaseAdmin } = require('../lib/supabase');

// Get all templates (public and user's own)
router.get('/', authenticate, async (req, res) => {
  try {
    const { category } = req.query;

    let query = req.supabase
      .from('templates')
      .select('*')
      .order('usage_count', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single template
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('templates')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(404).json({ error: 'Template not found' });
  }
});

// Create template
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, category, systemPrompt, intents, sampleResponses, isPublic } = req.body;

    const { data, error } = await req.supabase
      .from('templates')
      .insert({
        user_id: req.user.id,
        name,
        description,
        category,
        system_prompt: systemPrompt,
        intents,
        sample_responses: sampleResponses,
        is_public: isPublic || false
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update template
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, description, category, systemPrompt, intents, sampleResponses, isPublic } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (systemPrompt !== undefined) updateData.system_prompt = systemPrompt;
    if (intents !== undefined) updateData.intents = intents;
    if (sampleResponses !== undefined) updateData.sample_responses = sampleResponses;
    if (isPublic !== undefined) updateData.is_public = isPublic;

    const { data, error } = await req.supabase
      .from('templates')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete template
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { error } = await req.supabase
      .from('templates')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: 'Template deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Use template (increment usage count)
router.post('/:id/use', authenticate, async (req, res) => {
  try {
    // Get template
    const { data: template, error: fetchError } = await req.supabase
      .from('templates')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError) throw fetchError;

    // Increment usage count
    await supabaseAdmin
      .from('templates')
      .update({ usage_count: (template.usage_count || 0) + 1 })
      .eq('id', req.params.id);

    res.json({ 
      message: 'Template usage recorded',
      template
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
