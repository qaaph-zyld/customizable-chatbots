const express = require('express');
const router = express.Router();
const store = require('../data/store');

// GET overview analytics
router.get('/overview', (req, res) => {
  const analytics = store.getAnalytics('overview');
  res.json(analytics);
});

// GET conversations analytics
router.get('/conversations', (req, res) => {
  const analytics = store.getAnalytics('conversations');
  res.json(analytics);
});

// GET templates analytics
router.get('/templates', (req, res) => {
  const analytics = store.getAnalytics('templates');
  res.json(analytics);
});

// GET user engagement analytics
router.get('/user-engagement', (req, res) => {
  const analytics = store.getAnalytics('userEngagement');
  res.json(analytics);
});

// GET response quality analytics
router.get('/response-quality', (req, res) => {
  const analytics = store.getAnalytics('responseQuality');
  res.json(analytics);
});

// GET all analytics (combined)
router.get('/', (req, res) => {
  const analytics = store.getAnalytics();
  res.json(analytics);
});

module.exports = router;
