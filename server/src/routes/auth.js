const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../lib/supabase');
const { authenticateUser } = require('../middleware/auth');
const CryptoJS = require('crypto-js');
const { v4: uuidv4 } = require('uuid');

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (error) throw error;

    res.json({
      message: 'Sign up successful. Please check your email for verification.',
      user: data.user
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Sign in
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    res.json({
      user: data.user,
      session: data.session
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Sign out
router.post('/signout', authenticateUser, async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    res.json({ message: 'Signed out successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get current user
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update profile
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    const { fullName, companyName, avatarUrl } = req.body;

    const { data, error } = await req.supabase
      .from('profiles')
      .update({
        full_name: fullName,
        company_name: companyName,
        avatar_url: avatarUrl
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create API key
router.post('/api-keys', authenticateUser, async (req, res) => {
  try {
    const { name, permissions = ['read'], expiresIn } = req.body;

    // Generate a random API key
    const apiKey = `cb_${uuidv4().replace(/-/g, '')}`;
    const keyHash = CryptoJS.SHA256(apiKey).toString();
    const keyPrefix = apiKey.substring(0, 10);

    let expiresAt = null;
    if (expiresIn) {
      expiresAt = new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000).toISOString();
    }

    const { data, error } = await req.supabase
      .from('api_keys')
      .insert({
        user_id: req.user.id,
        name,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        permissions,
        expires_at: expiresAt
      })
      .select()
      .single();

    if (error) throw error;

    // Return the full API key only once
    res.json({
      ...data,
      key: apiKey,
      message: 'Save this API key securely. It will not be shown again.'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// List API keys
router.get('/api-keys', authenticateUser, async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('api_keys')
      .select('id, name, key_prefix, permissions, last_used_at, expires_at, created_at')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete API key
router.delete('/api-keys/:id', authenticateUser, async (req, res) => {
  try {
    const { error } = await req.supabase
      .from('api_keys')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({ message: 'API key deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// OAuth callback handler
router.get('/callback', async (req, res) => {
  const { code } = req.query;

  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
      
      // Redirect to frontend with session
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?access_token=${data.session.access_token}`);
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/error`);
    }
  }
});

module.exports = router;
