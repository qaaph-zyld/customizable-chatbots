const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth } = require('../middleware/auth');
const { supabaseAdmin } = require('../lib/supabase');

// Get all chatbots for user
router.get('/', authenticate, async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('chatbots')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single chatbot
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('chatbots')
      .select('*, templates(*)')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(404).json({ error: 'Chatbot not found' });
  }
});

// Get public chatbot info (for widget)
router.get('/:id/public', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('chatbots')
      .select('id, name, description, widget_config, settings, status')
      .eq('id', req.params.id)
      .eq('status', 'active')
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(404).json({ error: 'Chatbot not found or inactive' });
  }
});

// Create chatbot
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, templateId, settings, systemPrompt, widgetConfig } = req.body;

    const { data, error } = await req.supabase
      .from('chatbots')
      .insert({
        user_id: req.user.id,
        name,
        description,
        template_id: templateId,
        settings,
        system_prompt: systemPrompt,
        widget_config: widgetConfig
      })
      .select()
      .single();

    if (error) throw error;

    // Track analytics event
    await supabaseAdmin.from('analytics_events').insert({
      chatbot_id: data.id,
      event_type: 'chatbot_created',
      event_data: { name }
    });

    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update chatbot
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, description, templateId, settings, systemPrompt, widgetConfig, allowedDomains } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (templateId !== undefined) updateData.template_id = templateId;
    if (settings !== undefined) updateData.settings = settings;
    if (systemPrompt !== undefined) updateData.system_prompt = systemPrompt;
    if (widgetConfig !== undefined) updateData.widget_config = widgetConfig;
    if (allowedDomains !== undefined) updateData.allowed_domains = allowedDomains;

    const { data, error } = await req.supabase
      .from('chatbots')
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

// Delete chatbot
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { error } = await req.supabase
      .from('chatbots')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: 'Chatbot deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Toggle chatbot status
router.post('/:id/toggle-status', authenticate, async (req, res) => {
  try {
    // Get current status
    const { data: current, error: fetchError } = await req.supabase
      .from('chatbots')
      .select('status')
      .eq('id', req.params.id)
      .single();

    if (fetchError) throw fetchError;

    const newStatus = current.status === 'active' ? 'inactive' : 'active';

    const { data, error } = await req.supabase
      .from('chatbots')
      .update({ status: newStatus })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get chatbot statistics
router.get('/:id/stats', authenticate, async (req, res) => {
  try {
    const chatbotId = req.params.id;

    // Get conversation count
    const { count: conversationCount } = await req.supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('chatbot_id', chatbotId);

    // Get message count
    const { data: conversations } = await req.supabase
      .from('conversations')
      .select('id')
      .eq('chatbot_id', chatbotId);

    const conversationIds = conversations?.map(c => c.id) || [];
    
    let messageCount = 0;
    if (conversationIds.length > 0) {
      const { count } = await supabaseAdmin
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', conversationIds);
      messageCount = count || 0;
    }

    // Get recent events
    const { data: recentEvents } = await supabaseAdmin
      .from('analytics_events')
      .select('*')
      .eq('chatbot_id', chatbotId)
      .order('created_at', { ascending: false })
      .limit(10);

    res.json({
      totalConversations: conversationCount || 0,
      totalMessages: messageCount,
      recentEvents: recentEvents || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
