const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { supabaseAdmin } = require('../lib/supabase');

// Get overview analytics
router.get('/overview', authenticate, async (req, res) => {
  try {
    // Get user's chatbots
    const { data: chatbots } = await req.supabase
      .from('chatbots')
      .select('id');

    const chatbotIds = chatbots?.map(c => c.id) || [];

    if (chatbotIds.length === 0) {
      return res.json({
        totalChatbots: 0,
        totalConversations: 0,
        totalMessages: 0,
        avgResponseTime: 0,
        satisfactionRate: 0,
        trends: []
      });
    }

    // Get conversation count
    const { count: totalConversations } = await supabaseAdmin
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .in('chatbot_id', chatbotIds);

    // Get message stats
    const { data: conversations } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .in('chatbot_id', chatbotIds);

    const conversationIds = conversations?.map(c => c.id) || [];
    
    let totalMessages = 0;
    let positiveMessages = 0;
    let totalMessagesWithSentiment = 0;

    if (conversationIds.length > 0) {
      const { count } = await supabaseAdmin
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', conversationIds);
      totalMessages = count || 0;

      // Get sentiment distribution
      const { data: sentimentData } = await supabaseAdmin
        .from('messages')
        .select('sentiment')
        .in('conversation_id', conversationIds)
        .not('sentiment', 'is', null);

      if (sentimentData) {
        totalMessagesWithSentiment = sentimentData.length;
        positiveMessages = sentimentData.filter(m => m.sentiment === 'positive').length;
      }
    }

    // Calculate satisfaction rate
    const satisfactionRate = totalMessagesWithSentiment > 0
      ? Math.round((positiveMessages / totalMessagesWithSentiment) * 100)
      : 0;

    // Get trends (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: recentConversations } = await supabaseAdmin
      .from('conversations')
      .select('created_at')
      .in('chatbot_id', chatbotIds)
      .gte('created_at', thirtyDaysAgo);

    // Group by date
    const trendMap = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      trendMap[dateStr] = 0;
    }

    (recentConversations || []).forEach(conv => {
      const date = conv.created_at.split('T')[0];
      if (trendMap[date] !== undefined) {
        trendMap[date]++;
      }
    });

    const trends = Object.entries(trendMap).map(([date, conversations]) => ({
      date,
      conversations
    }));

    res.json({
      totalChatbots: chatbotIds.length,
      totalConversations: totalConversations || 0,
      totalMessages,
      avgResponseTime: 1.2, // Would need actual timing data
      satisfactionRate,
      trends
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get conversation analytics
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const { data: chatbots } = await req.supabase.from('chatbots').select('id, name');
    const chatbotIds = chatbots?.map(c => c.id) || [];

    if (chatbotIds.length === 0) {
      return res.json({
        total: 0,
        resolved: 0,
        escalated: 0,
        avgDuration: 0,
        byStatus: [],
        byChatbot: []
      });
    }

    const { data: conversations } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .in('chatbot_id', chatbotIds);

    const total = conversations?.length || 0;
    const resolved = conversations?.filter(c => c.status === 'resolved').length || 0;
    const escalated = conversations?.filter(c => c.status === 'escalated').length || 0;
    const active = conversations?.filter(c => c.status === 'active').length || 0;

    // Calculate average duration for resolved conversations
    const resolvedConvs = conversations?.filter(c => c.ended_at) || [];
    const avgDuration = resolvedConvs.length > 0
      ? resolvedConvs.reduce((sum, c) => {
          return sum + (new Date(c.ended_at) - new Date(c.started_at)) / 1000;
        }, 0) / resolvedConvs.length
      : 0;

    // By status
    const byStatus = [
      { status: 'active', count: active },
      { status: 'resolved', count: resolved },
      { status: 'escalated', count: escalated }
    ];

    // By chatbot
    const byChatbot = chatbots?.map(bot => ({
      chatbotId: bot.id,
      chatbotName: bot.name,
      count: conversations?.filter(c => c.chatbot_id === bot.id).length || 0
    })) || [];

    res.json({
      total,
      resolved,
      escalated,
      avgDuration: Math.round(avgDuration),
      byStatus,
      byChatbot
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get template analytics
router.get('/templates', authenticate, async (req, res) => {
  try {
    const { data: templates } = await req.supabase
      .from('templates')
      .select('*')
      .order('usage_count', { ascending: false });

    const total = templates?.length || 0;
    
    // By category
    const categoryMap = {};
    templates?.forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + 1;
    });
    const byCategory = Object.entries(categoryMap).map(([category, count]) => ({ category, count }));

    // Top performers
    const topPerformers = (templates || []).slice(0, 5);

    // Usage data
    const usage = templates?.map(t => ({
      templateId: t.id,
      templateName: t.name,
      usageCount: t.usage_count || 0
    })) || [];

    res.json({
      total,
      byCategory,
      topPerformers,
      usage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user engagement analytics
router.get('/user-engagement', authenticate, async (req, res) => {
  try {
    const { data: chatbots } = await req.supabase.from('chatbots').select('id');
    const chatbotIds = chatbots?.map(c => c.id) || [];

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Get conversations
    const { data: conversations } = await supabaseAdmin
      .from('conversations')
      .select('visitor_id, created_at')
      .in('chatbot_id', chatbotIds)
      .gte('created_at', thirtyDaysAgo);

    // Unique visitors
    const uniqueVisitors = new Set(conversations?.map(c => c.visitor_id) || []);
    const totalUsers = uniqueVisitors.size;

    // Active users (last 7 days)
    const recentConversations = conversations?.filter(c => c.created_at >= sevenDaysAgo) || [];
    const activeVisitors = new Set(recentConversations.map(c => c.visitor_id));
    const activeUsers = activeVisitors.size;

    // New users (first conversation in last 7 days)
    const oldConversations = conversations?.filter(c => c.created_at < sevenDaysAgo) || [];
    const oldVisitors = new Set(oldConversations.map(c => c.visitor_id));
    const newUsers = [...activeVisitors].filter(v => !oldVisitors.has(v)).length;

    // Retention rate
    const retentionRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

    // By day
    const byDayMap = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      byDayMap[dateStr] = { visitors: new Set(), newVisitors: new Set() };
    }

    const seenVisitors = new Set();
    const sortedConvs = [...(conversations || [])].sort((a, b) => 
      new Date(a.created_at) - new Date(b.created_at)
    );

    sortedConvs.forEach(conv => {
      const date = conv.created_at.split('T')[0];
      if (byDayMap[date]) {
        byDayMap[date].visitors.add(conv.visitor_id);
        if (!seenVisitors.has(conv.visitor_id)) {
          byDayMap[date].newVisitors.add(conv.visitor_id);
          seenVisitors.add(conv.visitor_id);
        }
      }
    });

    const byDay = Object.entries(byDayMap).map(([date, data]) => ({
      date,
      totalUsers: data.visitors.size,
      newUsers: data.newVisitors.size
    }));

    res.json({
      totalUsers,
      activeUsers,
      newUsers,
      retentionRate,
      byDay
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get response quality analytics
router.get('/response-quality', authenticate, async (req, res) => {
  try {
    const { data: chatbots } = await req.supabase.from('chatbots').select('id');
    const chatbotIds = chatbots?.map(c => c.id) || [];

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: conversations } = await supabaseAdmin
      .from('conversations')
      .select('id, status, created_at')
      .in('chatbot_id', chatbotIds)
      .gte('created_at', thirtyDaysAgo);

    const conversationIds = conversations?.map(c => c.id) || [];

    let messages = [];
    if (conversationIds.length > 0) {
      const { data } = await supabaseAdmin
        .from('messages')
        .select('sentiment, tokens_used, created_at, conversation_id')
        .in('conversation_id', conversationIds);
      messages = data || [];
    }

    // Sentiment breakdown
    const userMessages = messages.filter(m => m.sentiment);
    const sentimentCounts = {
      positive: userMessages.filter(m => m.sentiment === 'positive').length,
      neutral: userMessages.filter(m => m.sentiment === 'neutral').length,
      negative: userMessages.filter(m => m.sentiment === 'negative').length
    };
    const totalWithSentiment = userMessages.length || 1;

    const sentimentBreakdown = [
      { sentiment: 'positive', percentage: Math.round((sentimentCounts.positive / totalWithSentiment) * 100) },
      { sentiment: 'neutral', percentage: Math.round((sentimentCounts.neutral / totalWithSentiment) * 100) },
      { sentiment: 'negative', percentage: Math.round((sentimentCounts.negative / totalWithSentiment) * 100) }
    ];

    // Resolution and escalation rates
    const totalConvs = conversations?.length || 1;
    const resolved = conversations?.filter(c => c.status === 'resolved').length || 0;
    const escalated = conversations?.filter(c => c.status === 'escalated').length || 0;

    const resolutionRate = Math.round((resolved / totalConvs) * 100);
    const escalationRate = Math.round((escalated / totalConvs) * 100);

    // Quality score (composite)
    const qualityScore = Math.round(
      (sentimentBreakdown[0].percentage * 0.4 + resolutionRate * 0.4 + (100 - escalationRate) * 0.2) / 10
    );

    // Trends
    const trendMap = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      trendMap[dateStr] = { positive: 0, total: 0 };
    }

    userMessages.forEach(msg => {
      const date = msg.created_at.split('T')[0];
      if (trendMap[date]) {
        trendMap[date].total++;
        if (msg.sentiment === 'positive') trendMap[date].positive++;
      }
    });

    const trends = Object.entries(trendMap).map(([date, data]) => ({
      date,
      qualityScore: data.total > 0 ? Math.round((data.positive / data.total) * 10) : 5
    }));

    res.json({
      avgResponseTime: 1.2,
      qualityScore,
      resolutionRate,
      escalationRate,
      sentimentBreakdown,
      trends
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all analytics
router.get('/all', authenticate, async (req, res) => {
  try {
    // Reuse existing endpoints
    const [overview, conversations, templates, engagement, quality] = await Promise.all([
      fetch(`${req.protocol}://${req.get('host')}/api/analytics-dashboard/overview`, {
        headers: { Authorization: req.headers.authorization }
      }).then(r => r.json()),
      fetch(`${req.protocol}://${req.get('host')}/api/analytics-dashboard/conversations`, {
        headers: { Authorization: req.headers.authorization }
      }).then(r => r.json()),
      fetch(`${req.protocol}://${req.get('host')}/api/analytics-dashboard/templates`, {
        headers: { Authorization: req.headers.authorization }
      }).then(r => r.json()),
      fetch(`${req.protocol}://${req.get('host')}/api/analytics-dashboard/user-engagement`, {
        headers: { Authorization: req.headers.authorization }
      }).then(r => r.json()),
      fetch(`${req.protocol}://${req.get('host')}/api/analytics-dashboard/response-quality`, {
        headers: { Authorization: req.headers.authorization }
      }).then(r => r.json())
    ]);

    res.json({ overview, conversations, templates, engagement, quality });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
