const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth } = require('../middleware/auth');
const { supabaseAdmin } = require('../lib/supabase');
const { generateChatResponse, generateEmbedding, analyzeSentiment } = require('../lib/openai');
const { v4: uuidv4 } = require('uuid');

// Get all conversations for a chatbot
router.get('/', authenticate, async (req, res) => {
  try {
    const { chatbotId, status, limit = 50, offset = 0 } = req.query;

    let query = req.supabase
      .from('conversations')
      .select('*, chatbots(name)')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (chatbotId) {
      query = query.eq('chatbot_id', chatbotId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single conversation with messages
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { data: conversation, error: convError } = await req.supabase
      .from('conversations')
      .select('*, chatbots(name, settings)')
      .eq('id', req.params.id)
      .single();

    if (convError) throw convError;

    const { data: messages, error: msgError } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('conversation_id', req.params.id)
      .order('created_at', { ascending: true });

    if (msgError) throw msgError;

    res.json({ ...conversation, messages });
  } catch (error) {
    res.status(404).json({ error: 'Conversation not found' });
  }
});

// Start a new conversation (public endpoint for widget)
router.post('/start', async (req, res) => {
  try {
    const { chatbotId, visitorId, channel = 'web', metadata = {} } = req.body;

    // Verify chatbot exists and is active
    const { data: chatbot, error: chatbotError } = await supabaseAdmin
      .from('chatbots')
      .select('*')
      .eq('id', chatbotId)
      .eq('status', 'active')
      .single();

    if (chatbotError || !chatbot) {
      return res.status(404).json({ error: 'Chatbot not found or inactive' });
    }

    const sessionId = uuidv4();

    // Create conversation
    const { data: conversation, error: convError } = await supabaseAdmin
      .from('conversations')
      .insert({
        chatbot_id: chatbotId,
        session_id: sessionId,
        visitor_id: visitorId || uuidv4(),
        channel,
        metadata
      })
      .select()
      .single();

    if (convError) throw convError;

    // Add welcome message
    const welcomeMessage = chatbot.settings?.welcomeMessage || 'Hello! How can I help you today?';
    
    const { data: message, error: msgError } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        role: 'assistant',
        content: welcomeMessage
      })
      .select()
      .single();

    if (msgError) throw msgError;

    // Track analytics
    await supabaseAdmin.from('analytics_events').insert({
      chatbot_id: chatbotId,
      conversation_id: conversation.id,
      event_type: 'conversation_started',
      event_data: { channel, visitorId }
    });

    res.status(201).json({
      ...conversation,
      messages: [message],
      chatbot: {
        name: chatbot.name,
        widgetConfig: chatbot.widget_config
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send a message (public endpoint for widget)
router.post('/:id/messages', async (req, res) => {
  try {
    const { content, visitorId } = req.body;
    const conversationId = req.params.id;

    // Get conversation with chatbot info
    const { data: conversation, error: convError } = await supabaseAdmin
      .from('conversations')
      .select('*, chatbots(*)')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const chatbot = conversation.chatbots;

    // Save user message
    const { data: userMessage, error: userMsgError } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content
      })
      .select()
      .single();

    if (userMsgError) throw userMsgError;

    // Get conversation history
    const { data: history } = await supabaseAdmin
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(20);

    // Search knowledge base for context (RAG)
    let context = '';
    try {
      const embedding = await generateEmbedding(content);
      const { data: chunks } = await supabaseAdmin.rpc('match_documents', {
        query_embedding: embedding,
        match_chatbot_id: chatbot.id,
        match_threshold: 0.7,
        match_count: 3
      });

      if (chunks && chunks.length > 0) {
        context = '\n\nRelevant context from knowledge base:\n' + 
          chunks.map(c => c.content).join('\n---\n');
      }
    } catch (e) {
      // RAG is optional, continue without it
      console.log('RAG search skipped:', e.message);
    }

    // Generate AI response
    let aiResponse;
    try {
      const systemPrompt = (chatbot.system_prompt || 'You are a helpful assistant.') + context;
      
      const messages = history.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }));

      aiResponse = await generateChatResponse(messages, {
        model: chatbot.settings?.aiModel || 'gpt-4o-mini',
        temperature: chatbot.settings?.temperature || 0.7,
        maxTokens: chatbot.settings?.maxTokens || 500,
        systemPrompt
      });
    } catch (e) {
      console.error('AI response failed:', e);
      aiResponse = {
        content: chatbot.settings?.fallbackMessage || "I'm having trouble understanding. Could you rephrase that?",
        tokensUsed: 0
      };
    }

    // Analyze sentiment
    const sentiment = await analyzeSentiment(content);

    // Update user message with sentiment
    await supabaseAdmin
      .from('messages')
      .update({ sentiment })
      .eq('id', userMessage.id);

    // Save assistant response
    const { data: assistantMessage, error: assistMsgError } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: aiResponse.content,
        tokens_used: aiResponse.tokensUsed,
        metadata: { model: aiResponse.model }
      })
      .select()
      .single();

    if (assistMsgError) throw assistMsgError;

    // Track analytics
    await supabaseAdmin.from('analytics_events').insert({
      chatbot_id: chatbot.id,
      conversation_id: conversationId,
      event_type: 'message_sent',
      event_data: { 
        tokensUsed: aiResponse.tokensUsed,
        sentiment,
        hasContext: context.length > 0
      }
    });

    // Trigger webhooks
    triggerWebhooks(chatbot.user_id, chatbot.id, 'message.created', {
      conversationId,
      userMessage: { ...userMessage, sentiment },
      assistantMessage
    });

    res.json({
      userMessage: { ...userMessage, sentiment },
      assistantMessage
    });
  } catch (error) {
    console.error('Message error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update conversation status
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;

    const { data, error } = await req.supabase
      .from('conversations')
      .update({ 
        status,
        ended_at: ['resolved', 'abandoned'].includes(status) ? new Date().toISOString() : null
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    // Track analytics
    await supabaseAdmin.from('analytics_events').insert({
      chatbot_id: data.chatbot_id,
      conversation_id: data.id,
      event_type: `conversation_${status}`,
      event_data: {}
    });

    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Helper function to trigger webhooks
async function triggerWebhooks(userId, chatbotId, event, payload) {
  try {
    const { data: webhooks } = await supabaseAdmin
      .from('webhooks')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .or(`chatbot_id.eq.${chatbotId},chatbot_id.is.null`);

    if (!webhooks || webhooks.length === 0) return;

    const axios = require('axios');
    const CryptoJS = require('crypto-js');

    for (const webhook of webhooks) {
      if (!webhook.events.includes(event) && !webhook.events.includes('*')) continue;

      const signature = webhook.secret 
        ? CryptoJS.HmacSHA256(JSON.stringify(payload), webhook.secret).toString()
        : null;

      try {
        const response = await axios.post(webhook.url, {
          event,
          payload,
          timestamp: new Date().toISOString()
        }, {
          headers: {
            'Content-Type': 'application/json',
            ...(signature && { 'X-Webhook-Signature': signature })
          },
          timeout: 5000
        });

        // Log successful webhook
        await supabaseAdmin.from('webhook_logs').insert({
          webhook_id: webhook.id,
          event,
          payload,
          response_status: response.status,
          response_body: JSON.stringify(response.data).substring(0, 1000)
        });
      } catch (e) {
        // Log failed webhook
        await supabaseAdmin.from('webhook_logs').insert({
          webhook_id: webhook.id,
          event,
          payload,
          response_status: e.response?.status || 0,
          response_body: e.message
        });
      }
    }
  } catch (e) {
    console.error('Webhook trigger error:', e);
  }
}

module.exports = router;
