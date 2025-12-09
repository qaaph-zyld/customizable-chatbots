const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { supabaseAdmin } = require('../lib/supabase');

// Get all integrations
router.get('/', authenticate, async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('integrations')
      .select('*, chatbots(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Hide sensitive config data
    const safeData = data.map(integration => ({
      ...integration,
      config: {
        ...integration.config,
        accessToken: integration.config.accessToken ? '***hidden***' : undefined,
        authToken: integration.config.authToken ? '***hidden***' : undefined
      }
    }));

    res.json(safeData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single integration
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('integrations')
      .select('*, chatbots(name)')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(404).json({ error: 'Integration not found' });
  }
});

// Create integration
router.post('/', authenticate, async (req, res) => {
  try {
    const { type, chatbotId, config } = req.body;

    const { data, error } = await req.supabase
      .from('integrations')
      .insert({
        user_id: req.user.id,
        chatbot_id: chatbotId,
        type,
        config
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update integration
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { chatbotId, config, isActive } = req.body;

    const updateData = {};
    if (chatbotId !== undefined) updateData.chatbot_id = chatbotId;
    if (config !== undefined) updateData.config = config;
    if (isActive !== undefined) updateData.is_active = isActive;

    const { data, error } = await req.supabase
      .from('integrations')
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

// Delete integration
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { error } = await req.supabase
      .from('integrations')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: 'Integration deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Toggle integration status
router.post('/:id/toggle', authenticate, async (req, res) => {
  try {
    const { data: current, error: fetchError } = await req.supabase
      .from('integrations')
      .select('is_active')
      .eq('id', req.params.id)
      .single();

    if (fetchError) throw fetchError;

    const { data, error } = await req.supabase
      .from('integrations')
      .update({ is_active: !current.is_active })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ===== SLACK INTEGRATION =====

// Slack OAuth callback
router.get('/slack/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/integrations/slack/error`);
    }

    // Exchange code for access token
    const axios = require('axios');
    const response = await axios.post('https://slack.com/api/oauth.v2.access', null, {
      params: {
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.API_URL}/api/integrations/slack/callback`
      }
    });

    if (!response.data.ok) {
      throw new Error(response.data.error);
    }

    // Parse state to get user and chatbot info
    const { userId, chatbotId } = JSON.parse(Buffer.from(state, 'base64').toString());

    // Save integration
    await supabaseAdmin.from('integrations').insert({
      user_id: userId,
      chatbot_id: chatbotId,
      type: 'slack',
      config: {
        accessToken: response.data.access_token,
        teamId: response.data.team?.id,
        teamName: response.data.team?.name,
        botUserId: response.data.bot_user_id,
        scope: response.data.scope
      }
    });

    res.redirect(`${process.env.FRONTEND_URL}/integrations/slack/success`);
  } catch (error) {
    console.error('Slack OAuth error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/integrations/slack/error`);
  }
});

// Slack events webhook
router.post('/slack/events', async (req, res) => {
  try {
    const { type, challenge, event } = req.body;

    // URL verification
    if (type === 'url_verification') {
      return res.json({ challenge });
    }

    // Handle events
    if (type === 'event_callback' && event) {
      // Verify the request is from Slack
      // (In production, verify the signature using SLACK_SIGNING_SECRET)

      // Handle message events
      if (event.type === 'message' && !event.bot_id) {
        await handleSlackMessage(event, req.body.team_id);
      }
    }

    res.status(200).send();
  } catch (error) {
    console.error('Slack event error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Handle Slack messages
async function handleSlackMessage(event, teamId) {
  try {
    // Find integration by team ID
    const { data: integration } = await supabaseAdmin
      .from('integrations')
      .select('*, chatbots(*)')
      .eq('type', 'slack')
      .eq('is_active', true)
      .filter('config->teamId', 'eq', teamId)
      .single();

    if (!integration) return;

    const axios = require('axios');
    const { generateChatResponse } = require('../lib/openai');

    // Get or create conversation
    let { data: conversation } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .eq('chatbot_id', integration.chatbot_id)
      .eq('channel', 'slack')
      .eq('metadata->slackChannel', event.channel)
      .eq('status', 'active')
      .single();

    if (!conversation) {
      const { data: newConv } = await supabaseAdmin
        .from('conversations')
        .insert({
          chatbot_id: integration.chatbot_id,
          session_id: `slack_${event.channel}_${Date.now()}`,
          visitor_id: event.user,
          channel: 'slack',
          metadata: { slackChannel: event.channel, slackUser: event.user }
        })
        .select()
        .single();
      conversation = newConv;
    }

    // Save user message
    await supabaseAdmin.from('messages').insert({
      conversation_id: conversation.id,
      role: 'user',
      content: event.text
    });

    // Get conversation history
    const { data: history } = await supabaseAdmin
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true })
      .limit(10);

    // Generate AI response
    const chatbot = integration.chatbots;
    const aiResponse = await generateChatResponse(
      history.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
      {
        systemPrompt: chatbot.system_prompt,
        model: chatbot.settings?.aiModel,
        temperature: chatbot.settings?.temperature
      }
    );

    // Save assistant message
    await supabaseAdmin.from('messages').insert({
      conversation_id: conversation.id,
      role: 'assistant',
      content: aiResponse.content,
      tokens_used: aiResponse.tokensUsed
    });

    // Send response to Slack
    await axios.post('https://slack.com/api/chat.postMessage', {
      channel: event.channel,
      text: aiResponse.content,
      thread_ts: event.thread_ts || event.ts
    }, {
      headers: {
        'Authorization': `Bearer ${integration.config.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Slack message handling error:', error);
  }
}

// Get Slack OAuth URL
router.get('/slack/oauth-url', authenticate, async (req, res) => {
  try {
    const { chatbotId } = req.query;
    
    const state = Buffer.from(JSON.stringify({
      userId: req.user.id,
      chatbotId
    })).toString('base64');

    const url = `https://slack.com/oauth/v2/authorize?client_id=${process.env.SLACK_CLIENT_ID}&scope=chat:write,channels:history,groups:history,im:history,mpim:history&redirect_uri=${encodeURIComponent(process.env.API_URL + '/api/integrations/slack/callback')}&state=${state}`;

    res.json({ url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
