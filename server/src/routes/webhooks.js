const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { supabaseAdmin } = require('../lib/supabase');
const CryptoJS = require('crypto-js');

// Get all webhooks
router.get('/', authenticate, async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('webhooks')
      .select('*, chatbots(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single webhook
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('webhooks')
      .select('*, chatbots(name)')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(404).json({ error: 'Webhook not found' });
  }
});

// Create webhook
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, url, chatbotId, events, secret } = req.body;

    // Generate secret if not provided
    const webhookSecret = secret || CryptoJS.lib.WordArray.random(32).toString();

    const { data, error } = await req.supabase
      .from('webhooks')
      .insert({
        user_id: req.user.id,
        chatbot_id: chatbotId,
        name,
        url,
        secret: webhookSecret,
        events: events || ['*']
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      ...data,
      message: 'Webhook created. Save the secret securely.',
      secret: webhookSecret
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update webhook
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, url, chatbotId, events, isActive } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (url !== undefined) updateData.url = url;
    if (chatbotId !== undefined) updateData.chatbot_id = chatbotId;
    if (events !== undefined) updateData.events = events;
    if (isActive !== undefined) updateData.is_active = isActive;

    const { data, error } = await req.supabase
      .from('webhooks')
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

// Delete webhook
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { error } = await req.supabase
      .from('webhooks')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: 'Webhook deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Regenerate webhook secret
router.post('/:id/regenerate-secret', authenticate, async (req, res) => {
  try {
    const newSecret = CryptoJS.lib.WordArray.random(32).toString();

    const { data, error } = await req.supabase
      .from('webhooks')
      .update({ secret: newSecret })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      ...data,
      secret: newSecret,
      message: 'Secret regenerated. Save it securely.'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Test webhook
router.post('/:id/test', authenticate, async (req, res) => {
  try {
    const { data: webhook, error } = await req.supabase
      .from('webhooks')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;

    const axios = require('axios');
    const testPayload = {
      event: 'test',
      payload: {
        message: 'This is a test webhook from Customizable Chatbots',
        timestamp: new Date().toISOString()
      }
    };

    const signature = CryptoJS.HmacSHA256(JSON.stringify(testPayload), webhook.secret).toString();

    const response = await axios.post(webhook.url, testPayload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature
      },
      timeout: 10000
    });

    // Log the test
    await supabaseAdmin.from('webhook_logs').insert({
      webhook_id: webhook.id,
      event: 'test',
      payload: testPayload,
      response_status: response.status,
      response_body: JSON.stringify(response.data).substring(0, 1000)
    });

    res.json({
      success: true,
      status: response.status,
      response: response.data
    });
  } catch (error) {
    // Log the failure
    if (req.params.id) {
      await supabaseAdmin.from('webhook_logs').insert({
        webhook_id: req.params.id,
        event: 'test',
        payload: { test: true },
        response_status: error.response?.status || 0,
        response_body: error.message
      }).catch(() => {});
    }

    res.status(400).json({
      success: false,
      error: error.message,
      status: error.response?.status
    });
  }
});

// Get webhook logs
router.get('/:id/logs', authenticate, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const { data, error } = await supabaseAdmin
      .from('webhook_logs')
      .select('*')
      .eq('webhook_id', req.params.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Available webhook events
router.get('/events/list', authenticate, (req, res) => {
  res.json({
    events: [
      { name: '*', description: 'All events' },
      { name: 'conversation.started', description: 'New conversation started' },
      { name: 'conversation.resolved', description: 'Conversation marked as resolved' },
      { name: 'conversation.escalated', description: 'Conversation escalated to human' },
      { name: 'message.created', description: 'New message sent' },
      { name: 'chatbot.created', description: 'New chatbot created' },
      { name: 'chatbot.updated', description: 'Chatbot settings updated' },
      { name: 'chatbot.deleted', description: 'Chatbot deleted' }
    ]
  });
});

module.exports = router;
