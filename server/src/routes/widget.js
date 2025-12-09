const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../lib/supabase');

// Serve widget JavaScript
router.get('/embed.js', (req, res) => {
  const widgetScript = `
(function() {
  // Customizable Chatbots Widget v2.0
  window.ChatBotWidget = window.ChatBotWidget || {};
  
  const config = window.ChatBotWidget.config || {};
  const apiUrl = config.apiUrl || '${process.env.API_URL || 'http://localhost:3001'}';
  
  // Styles
  const styles = \`
    .cb-widget-container {
      position: fixed;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .cb-widget-container.bottom-right { bottom: 20px; right: 20px; }
    .cb-widget-container.bottom-left { bottom: 20px; left: 20px; }
    .cb-widget-container.top-right { top: 20px; right: 20px; }
    .cb-widget-container.top-left { top: 20px; left: 20px; }
    
    .cb-widget-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .cb-widget-button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0,0,0,0.2);
    }
    .cb-widget-button svg {
      width: 28px;
      height: 28px;
      fill: white;
    }
    
    .cb-widget-chat {
      position: absolute;
      bottom: 70px;
      width: 380px;
      height: 520px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      display: none;
      flex-direction: column;
      overflow: hidden;
    }
    .cb-widget-container.bottom-right .cb-widget-chat { right: 0; }
    .cb-widget-container.bottom-left .cb-widget-chat { left: 0; }
    .cb-widget-container.top-right .cb-widget-chat { top: 70px; bottom: auto; right: 0; }
    .cb-widget-container.top-left .cb-widget-chat { top: 70px; bottom: auto; left: 0; }
    .cb-widget-chat.open { display: flex; }
    
    .cb-widget-header {
      padding: 16px;
      color: white;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .cb-widget-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cb-widget-avatar svg { width: 24px; height: 24px; fill: white; }
    .cb-widget-title { font-weight: 600; font-size: 16px; }
    .cb-widget-status { font-size: 12px; opacity: 0.8; }
    .cb-widget-close {
      margin-left: auto;
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
    }
    
    .cb-widget-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .cb-message {
      max-width: 80%;
      padding: 12px 16px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.4;
    }
    .cb-message.user {
      align-self: flex-end;
      color: white;
      border-bottom-right-radius: 4px;
    }
    .cb-message.bot {
      align-self: flex-start;
      background: #f1f3f4;
      color: #333;
      border-bottom-left-radius: 4px;
    }
    
    .cb-widget-typing {
      display: flex;
      gap: 4px;
      padding: 12px 16px;
      background: #f1f3f4;
      border-radius: 16px;
      border-bottom-left-radius: 4px;
      align-self: flex-start;
    }
    .cb-widget-typing span {
      width: 8px;
      height: 8px;
      background: #999;
      border-radius: 50%;
      animation: cb-bounce 1.4s infinite ease-in-out;
    }
    .cb-widget-typing span:nth-child(1) { animation-delay: 0s; }
    .cb-widget-typing span:nth-child(2) { animation-delay: 0.2s; }
    .cb-widget-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes cb-bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }
    
    .cb-widget-input {
      padding: 16px;
      border-top: 1px solid #eee;
      display: flex;
      gap: 8px;
    }
    .cb-widget-input input {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid #e0e0e0;
      border-radius: 24px;
      font-size: 14px;
      outline: none;
    }
    .cb-widget-input input:focus {
      border-color: var(--cb-primary-color);
    }
    .cb-widget-input button {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cb-widget-input button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .cb-widget-input button svg {
      width: 20px;
      height: 20px;
      fill: white;
    }
    
    .cb-widget-powered {
      text-align: center;
      padding: 8px;
      font-size: 11px;
      color: #999;
    }
    .cb-widget-powered a {
      color: #666;
      text-decoration: none;
    }
  \`;
  
  // Create widget
  function createWidget(chatbot) {
    const primaryColor = chatbot.widget_config?.primaryColor || '#6366f1';
    const position = chatbot.widget_config?.position || 'bottom-right';
    
    // Inject styles
    const styleEl = document.createElement('style');
    styleEl.textContent = styles + \`:root { --cb-primary-color: \${primaryColor}; }\`;
    document.head.appendChild(styleEl);
    
    // Create container
    const container = document.createElement('div');
    container.className = 'cb-widget-container ' + position;
    container.innerHTML = \`
      <div class="cb-widget-chat" id="cb-chat">
        <div class="cb-widget-header" style="background: \${primaryColor}">
          <div class="cb-widget-avatar">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          </div>
          <div>
            <div class="cb-widget-title">\${chatbot.name}</div>
            <div class="cb-widget-status">Online</div>
          </div>
          <button class="cb-widget-close" onclick="ChatBotWidget.toggle()">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>
        <div class="cb-widget-messages" id="cb-messages"></div>
        <div class="cb-widget-input">
          <input type="text" id="cb-input" placeholder="Type a message..." onkeypress="if(event.key==='Enter')ChatBotWidget.send()">
          <button onclick="ChatBotWidget.send()" style="background: \${primaryColor}">
            <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
        <div class="cb-widget-powered">Powered by <a href="#">Chatbots Platform</a></div>
      </div>
      <button class="cb-widget-button" onclick="ChatBotWidget.toggle()" style="background: \${primaryColor}">
        <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
      </button>
    \`;
    document.body.appendChild(container);
    
    return container;
  }
  
  // Add message to chat
  function addMessage(content, isUser) {
    const messagesEl = document.getElementById('cb-messages');
    const messageEl = document.createElement('div');
    messageEl.className = 'cb-message ' + (isUser ? 'user' : 'bot');
    messageEl.style.background = isUser ? (window.ChatBotWidget.primaryColor || '#6366f1') : '';
    messageEl.textContent = content;
    messagesEl.appendChild(messageEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  
  // Show typing indicator
  function showTyping() {
    const messagesEl = document.getElementById('cb-messages');
    const typingEl = document.createElement('div');
    typingEl.className = 'cb-widget-typing';
    typingEl.id = 'cb-typing';
    typingEl.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(typingEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  
  function hideTyping() {
    const typingEl = document.getElementById('cb-typing');
    if (typingEl) typingEl.remove();
  }
  
  // Initialize widget
  window.ChatBotWidget.init = async function(options) {
    config.chatbotId = options.chatbotId;
    config.apiUrl = options.apiUrl || apiUrl;
    
    try {
      // Fetch chatbot info
      const response = await fetch(config.apiUrl + '/api/chatbots/' + config.chatbotId + '/public');
      const chatbot = await response.json();
      
      if (!chatbot.id) throw new Error('Chatbot not found');
      
      window.ChatBotWidget.primaryColor = chatbot.widget_config?.primaryColor;
      createWidget(chatbot);
      
      // Start conversation
      const convResponse = await fetch(config.apiUrl + '/api/conversations/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatbotId: config.chatbotId })
      });
      const conversation = await convResponse.json();
      config.conversationId = conversation.id;
      
      // Show welcome message
      if (conversation.messages && conversation.messages.length > 0) {
        conversation.messages.forEach(msg => {
          addMessage(msg.content, msg.role === 'user');
        });
      }
    } catch (error) {
      console.error('ChatBot Widget Error:', error);
    }
  };
  
  // Toggle chat
  window.ChatBotWidget.toggle = function() {
    const chatEl = document.getElementById('cb-chat');
    chatEl.classList.toggle('open');
  };
  
  // Send message
  window.ChatBotWidget.send = async function() {
    const inputEl = document.getElementById('cb-input');
    const message = inputEl.value.trim();
    if (!message || !config.conversationId) return;
    
    inputEl.value = '';
    addMessage(message, true);
    showTyping();
    
    try {
      const response = await fetch(config.apiUrl + '/api/conversations/' + config.conversationId + '/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message })
      });
      const data = await response.json();
      hideTyping();
      
      if (data.assistantMessage) {
        addMessage(data.assistantMessage.content, false);
      }
    } catch (error) {
      hideTyping();
      addMessage('Sorry, something went wrong. Please try again.', false);
    }
  };
  
  // Auto-init if config provided
  if (config.chatbotId) {
    window.ChatBotWidget.init(config);
  }
})();
`;

  res.set('Content-Type', 'application/javascript');
  res.send(widgetScript);
});

// Get widget configuration
router.get('/config/:chatbotId', async (req, res) => {
  try {
    const { data: chatbot, error } = await supabaseAdmin
      .from('chatbots')
      .select('id, name, widget_config')
      .eq('id', req.params.chatbotId)
      .eq('status', 'active')
      .single();

    if (error) throw error;

    res.json({
      chatbotId: chatbot.id,
      name: chatbot.name,
      config: chatbot.widget_config
    });
  } catch (error) {
    res.status(404).json({ error: 'Chatbot not found' });
  }
});

// Generate embed code
router.get('/embed-code/:chatbotId', async (req, res) => {
  try {
    const chatbotId = req.params.chatbotId;
    const apiUrl = process.env.API_URL || 'http://localhost:3001';

    const embedCode = `<!-- Chatbot Widget -->
<script>
  window.ChatBotWidget = window.ChatBotWidget || {};
  window.ChatBotWidget.config = {
    chatbotId: '${chatbotId}',
    apiUrl: '${apiUrl}'
  };
</script>
<script src="${apiUrl}/api/widget/embed.js" async></script>`;

    res.json({
      embedCode,
      chatbotId,
      instructions: [
        'Copy the embed code above',
        'Paste it before the closing </body> tag on your website',
        'The chat widget will appear in the corner of your page'
      ]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
