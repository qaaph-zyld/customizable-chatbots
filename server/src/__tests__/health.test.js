const request = require('supertest');
const app = require('..');

describe('GET /health', () => {
  it('returns ok status with basic metadata', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('version');
    expect(typeof res.body.supabase).toBe('boolean');
    expect(typeof res.body.openai).toBe('boolean');
  });
});
