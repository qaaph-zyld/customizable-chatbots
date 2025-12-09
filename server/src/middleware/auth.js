const { supabase, createAuthenticatedClient } = require('../lib/supabase');
const CryptoJS = require('crypto-js');

// Middleware to verify JWT token from Supabase
async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user and authenticated client to request
    req.user = user;
    req.supabase = createAuthenticatedClient(token);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

// Middleware to verify API key
async function authenticateApiKey(req, res, next) {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({ error: 'Missing API key' });
    }

    // Hash the API key
    const keyHash = CryptoJS.SHA256(apiKey).toString();
    
    // Look up the key in the database
    const { supabaseAdmin } = require('../lib/supabase');
    const { data: keyData, error } = await supabaseAdmin
      .from('api_keys')
      .select('*, profiles(*)')
      .eq('key_hash', keyHash)
      .single();
    
    if (error || !keyData) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Check if key is expired
    if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
      return res.status(401).json({ error: 'API key has expired' });
    }

    // Update last used timestamp
    await supabaseAdmin
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', keyData.id);

    // Attach user info to request
    req.user = keyData.profiles;
    req.apiKey = keyData;
    req.supabase = supabaseAdmin;
    next();
  } catch (error) {
    console.error('API key auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

// Combined auth - try JWT first, then API key
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers['x-api-key'];

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticateUser(req, res, next);
  } else if (apiKey) {
    return authenticateApiKey(req, res, next);
  } else {
    return res.status(401).json({ error: 'No authentication provided' });
  }
}

// Optional auth - doesn't fail if no auth provided
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        req.user = user;
        req.supabase = createAuthenticatedClient(token);
      }
    } catch (error) {
      // Ignore auth errors for optional auth
    }
  }
  
  next();
}

module.exports = {
  authenticateUser,
  authenticateApiKey,
  authenticate,
  optionalAuth
};
