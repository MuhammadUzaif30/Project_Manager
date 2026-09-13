const request = require('supertest');
const app = require('../app');
const { connect, closeDatabase, clearDatabase } = require('./setup');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe('POST /api/auth/register', () => {
  it('registers a new user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user.password).toBeUndefined();
  });

  it('rejects registration with a duplicate email', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'First User',
      email: 'dup@example.com',
      password: 'password123',
    });

    const res = await request(app).post('/api/auth/register').send({
      name: 'Second User',
      email: 'dup@example.com',
      password: 'password456',
    });

    expect(res.status).toBe(409);
  });

  it('rejects registration with an invalid email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'not-an-email',
      password: 'password123',
    });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash('correctpassword', 10);
    await User.create({ name: 'Login Test', email: 'login@example.com', password: hashedPassword });
  });

  it('logs in successfully with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'correctpassword',
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rejects login with the wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
  });

  it('rejects login for a nonexistent email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'doesnotexist@example.com',
      password: 'whatever123',
    });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me (protected endpoint)', () => {
  it('rejects a request with no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects a request with a malformed token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer garbage-token');
    expect(res.status).toBe(401);
  });

  it('returns the current user with a valid token', async () => {
    const registerRes = await request(app).post('/api/auth/register').send({
      name: 'Me Test',
      email: 'me@example.com',
      password: 'password123',
    });

    const token = registerRes.body.token;

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('me@example.com');
  });
});