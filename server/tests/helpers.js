const request = require('supertest');
const app = require('../app');
const Membership = require('../models/Membership');

const registerUser = async (overrides = {}) => {
  const userData = {
    name: 'Test User',
    email: `user${Date.now()}${Math.random()}@example.com`,
    password: 'password123',
    ...overrides,
  };

  const res = await request(app).post('/api/auth/register').send(userData);
  return { token: res.body.token, user: res.body.user };
};

const createOrganization = async (token, name = 'Test Org') => {
  const res = await request(app)
    .post('/api/organizations')
    .set('Authorization', `Bearer ${token}`)
    .send({ name });

  return res.body.organization;
};

const addUserToOrg = async (organizationId, userId, role = 'Member') => {
  await Membership.create({ user: userId, organization: organizationId, role });
};

module.exports = { registerUser, createOrganization, addUserToOrg };