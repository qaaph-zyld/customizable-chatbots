const request = require('supertest');
const app = require('..');

describe('GET /api', () => {
  it('returns API metadata with endpoints list', async () => {
    const res = await request(app).get('/api');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'Customizable Chatbots API');
    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('endpoints');
    expect(typeof res.body.endpoints).toBe('object');
    expect(res.body).toHaveProperty('documentation');
  });
});
