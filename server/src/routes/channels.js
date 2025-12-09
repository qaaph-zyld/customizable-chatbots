const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../lib/supabase');
const { generateChatResponse, analyzeSentiment } = require('../lib/openai');
const { v4: uuidv4 } = require('uuid');

// ===== TWILIO WHATSAPP/SMS =====

// Twilio webhook for incoming messages
router.post('/twilio/webhook', async (req, res) => {
  try {
    const {
      From,
      To,
      Body,
      MessageSid,
      AccountSid,
      NumMedia,
      ProfileName
    } = req.body;

    // Determine channel type
    const isWhatsApp = From.startsWith('whatsapp:');
    const channel = isWhatsApp ? 'whatsapp' : 'sms';
    const senderPhone = isWhatsApp ? From.replace('whatsapp:', '') : From;
    const receiverPhone = isWhatsApp ? To.replace('whatsapp:', '') : To;

    console.log(`Incoming ${channel} message from ${senderPhone}: ${Body}`);

    // Find integration by phone number
    const { data: integration } = await supabaseAdmin
      .from('integrations')
      .select('*, chatbots(*)')
      .eq('type', 'twilio')
      .eq('is_active', true)
      .or(`config->phoneNumber.eq.${receiverPhone},config->whatsappNumber.eq.${receiverPhone}`)
      .single();

    if (!integration) {
      console.log('No active Twilio integration found for:', receiverPhone);
      return res.status(200).send('No integration configured');
    }

    const chatbot = integration.chatbots;

    // Get or create conversation
    let { data: conversation } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .eq('chatbot_id', chatbot.id)
      .eq('channel', channel)
      .eq('visitor_id', senderPhone)
      .eq('status', 'active')
      .single();

    if (!conversation) {
      const { data: newConv } = await supabaseAdmin
        .from('conversations')
        .insert({
          chatbot_id: chatbot.id,
          session_id: `${channel}_${senderPhone}_${Date.now()}`,
          visitor_id: senderPhone,
          channel,
          metadata: {
            phone: senderPhone,
            profileName: ProfileName,
            messageSid: MessageSid
          }
        })
        .select()
        .single();
      conversation = newConv;

      // Track analytics
      await supabaseAdmin.from('analytics_events').insert({
        chatbot_id: chatbot.id,
        conversation_id: conversation.id,
        event_type: 'conversation_started',
        event_data: { channel, phone: senderPhone }
      });
    }

    // Save user message
    const sentiment = await analyzeSentiment(Body);
    await supabaseAdmin.from('messages').insert({
      conversation_id: conversation.id,
      role: 'user',
      content: Body,
      sentiment,
      metadata: { messageSid: MessageSid, numMedia: NumMedia }
    });

    // Get conversation history
    const { data: history } = await supabaseAdmin
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true })
      .limit(15);

    // Generate AI response
    let aiResponse;
    try {
      aiResponse = await generateChatResponse(
        history.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        })),
        {
          systemPrompt: chatbot.system_prompt,
          model: chatbot.settings?.aiModel || 'gpt-4o-mini',
          temperature: chatbot.settings?.temperature || 0.7,
          maxTokens: chatbot.settings?.maxTokens || 500
        }
      );
    } catch (e) {
      aiResponse = {
        content: chatbot.settings?.fallbackMessage || "I'm having trouble right now. Please try again later.",
        tokensUsed: 0
      };
    }

    // Save assistant message
    await supabaseAdmin.from('messages').insert({
      conversation_id: conversation.id,
      role: 'assistant',
      content: aiResponse.content,
      tokens_used: aiResponse.tokensUsed
    });

    // Track analytics
    await supabaseAdmin.from('analytics_events').insert({
      chatbot_id: chatbot.id,
      conversation_id: conversation.id,
      event_type: 'message_sent',
      event_data: { channel, tokensUsed: aiResponse.tokensUsed, sentiment }
    });

    // Send response via Twilio
    const twilio = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    await twilio.messages.create({
      body: aiResponse.content,
      from: To,
      to: From
    });

    // Return TwiML response (empty since we're sending via API)
    res.set('Content-Type', 'text/xml');
    res.send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  } catch (error) {
    console.error('Twilio webhook error:', error);
    res.status(500).send('Error processing message');
  }
});

// Twilio status callback
router.post('/twilio/status', async (req, res) => {
  try {
    const { MessageSid, MessageStatus, ErrorCode, ErrorMessage } = req.body;
    console.log(`Message ${MessageSid} status: ${MessageStatus}`);
    
    if (ErrorCode) {
      console.error(`Twilio error ${ErrorCode}: ${ErrorMessage}`);
    }

    res.status(200).send();
  } catch (error) {
    res.status(500).send();
  }
});

// ===== FACEBOOK MESSENGER =====

// Messenger webhook verification
router.get('/messenger/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.MESSENGER_VERIFY_TOKEN) {
    console.log('Messenger webhook verified');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Messenger webhook for incoming messages
router.post('/messenger/webhook', async (req, res) => {
  try {
    const { object, entry } = req.body;

    if (object !== 'page') {
      return res.sendStatus(404);
    }

    // Process each entry
    for (const pageEntry of entry) {
      const pageId = pageEntry.id;
      
      for (const messagingEvent of pageEntry.messaging || []) {
        if (messagingEvent.message) {
          await handleMessengerMessage(pageId, messagingEvent);
        }
      }
    }

    res.status(200).send('EVENT_RECEIVED');
  } catch (error) {
    console.error('Messenger webhook error:', error);
    res.status(500).send();
  }
});

async function handleMessengerMessage(pageId, event) {
  try {
    const senderId = event.sender.id;
    const messageText = event.message.text;

    if (!messageText) return;

    // Find integration by page ID
    const { data: integration } = await supabaseAdmin
      .from('integrations')
      .select('*, chatbots(*)')
      .eq('type', 'messenger')
      .eq('is_active', true)
      .filter('config->pageId', 'eq', pageId)
      .single();

    if (!integration) return;

    const chatbot = integration.chatbots;
    const axios = require('axios');

    // Get or create conversation
    let { data: conversation } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .eq('chatbot_id', chatbot.id)
      .eq('channel', 'messenger')
      .eq('visitor_id', senderId)
      .eq('status', 'active')
      .single();

    if (!conversation) {
      const { data: newConv } = await supabaseAdmin
        .from('conversations')
        .insert({
          chatbot_id: chatbot.id,
          session_id: `messenger_${senderId}_${Date.now()}`,
          visitor_id: senderId,
          channel: 'messenger',
          metadata: { pageId, senderId }
        })
        .select()
        .single();
      conversation = newConv;
    }

    // Save user message
    await supabaseAdmin.from('messages').insert({
      conversation_id: conversation.id,
      role: 'user',
      content: messageText
    });

    // Get history and generate response
    const { data: history } = await supabaseAdmin
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true })
      .limit(10);

    const aiResponse = await generateChatResponse(
      history.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
      {
        systemPrompt: chatbot.system_prompt,
        model: chatbot.settings?.aiModel
      }
    );

    // Save response
    await supabaseAdmin.from('messages').insert({
      conversation_id: conversation.id,
      role: 'assistant',
      content: aiResponse.content,
      tokens_used: aiResponse.tokensUsed
    });

    // Send to Messenger
    await axios.post(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${integration.config.pageAccessToken}`,
      {
        recipient: { id: senderId },
        message: { text: aiResponse.content }
      }
    );
  } catch (error) {
    console.error('Messenger message handling error:', error);
  }
}

// ===== EXTERNAL API =====

// API endpoint for external integrations
router.post('/api/message', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }

    const CryptoJS = require('crypto-js');
    const keyHash = CryptoJS.SHA256(apiKey).toString();

    // Verify API key
    const { data: keyData, error: keyError } = await supabaseAdmin
      .from('api_keys')
      .select('*, profiles(*)')
      .eq('key_hash', keyHash)
      .single();

    if (keyError || !keyData) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const { chatbotId, sessionId, message, metadata = {} } = req.body;

    // Verify chatbot belongs to user
    const { data: chatbot, error: chatbotError } = await supabaseAdmin
      .from('chatbots')
      .select('*')
      .eq('id', chatbotId)
      .eq('user_id', keyData.user_id)
      .single();

    if (chatbotError || !chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    // Get or create conversation
    let { data: conversation } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .eq('chatbot_id', chatbotId)
      .eq('session_id', sessionId)
      .eq('channel', 'api')
      .eq('status', 'active')
      .single();

    if (!conversation) {
      const { data: newConv } = await supabaseAdmin
        .from('conversations')
        .insert({
          chatbot_id: chatbotId,
          session_id: sessionId,
          visitor_id: metadata.visitorId || sessionId,
          channel: 'api',
          metadata
        })
        .select()
        .single();
      conversation = newConv;
    }

    // Save user message
    await supabaseAdmin.from('messages').insert({
      conversation_id: conversation.id,
      role: 'user',
      content: message
    });

    // Get history
    const { data: history } = await supabaseAdmin
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true })
      .limit(20);

    // Generate response
    const aiResponse = await generateChatResponse(
      history.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
      {
        systemPrompt: chatbot.system_prompt,
        model: chatbot.settings?.aiModel,
        temperature: chatbot.settings?.temperature,
        maxTokens: chatbot.settings?.maxTokens
      }
    );

    // Save response
    await supabaseAdmin.from('messages').insert({
      conversation_id: conversation.id,
      role: 'assistant',
      content: aiResponse.content,
      tokens_used: aiResponse.tokensUsed
    });

    res.json({
      conversationId: conversation.id,
      response: aiResponse.content,
      tokensUsed: aiResponse.tokensUsed
    });
  } catch (error) {
    console.error('API message error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
