const request = require('supertest');
const app = require('../app');
const { connect, closeDatabase, clearDatabase } = require('./setup');
const { registerUser, createOrganization, addUserToOrg } = require('./helpers');

beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe('Cross-organization access', () => {
  it('prevents a user from accessing an organization they do not belong to', async () => {
    const owner = await registerUser();
    const org = await createOrganization(owner.token);

    const outsider = await registerUser();

    const res = await request(app)
      .get(`/api/organizations/${org._id}/members`)
      .set('Authorization', `Bearer ${outsider.token}`);

    expect(res.status).toBe(403);
  });

  it('prevents a user from accessing a project belonging to another organization', async () => {
    const ownerA = await registerUser();
    const orgA = await createOrganization(ownerA.token);

    const projectRes = await request(app)
      .post(`/api/organizations/${orgA._id}/projects`)
      .set('Authorization', `Bearer ${ownerA.token}`)
      .send({ name: 'Org A Project' });
    const projectId = projectRes.body.project._id;

    const ownerB = await registerUser();
    const orgB = await createOrganization(ownerB.token);

    const res = await request(app)
      .get(`/api/organizations/${orgB._id}/projects/${projectId}`)
      .set('Authorization', `Bearer ${ownerB.token}`);

    expect(res.status).toBe(404);
  });
});

describe('Role-based permission checks', () => {
  it('prevents a Member from creating a project', async () => {
    const owner = await registerUser();
    const org = await createOrganization(owner.token);

    const member = await registerUser();
    await addUserToOrg(org._id, member.user.id, 'Member');

    const res = await request(app)
      .post(`/api/organizations/${org._id}/projects`)
      .set('Authorization', `Bearer ${member.token}`)
      .send({ name: 'Should Not Be Created' });

    expect(res.status).toBe(403);
  });

  it('prevents a Member from adding organization members', async () => {
    const owner = await registerUser();
    const org = await createOrganization(owner.token);

    const member = await registerUser();
    await addUserToOrg(org._id, member.user.id, 'Member');

    const someoneElse = await registerUser();

    const res = await request(app)
      .post(`/api/organizations/${org._id}/members`)
      .set('Authorization', `Bearer ${member.token}`)
      .send({ email: someoneElse.user.email, role: 'Member' });

    expect(res.status).toBe(403);
  });

  it('allows an Admin to create a project', async () => {
    const owner = await registerUser();
    const org = await createOrganization(owner.token);

    const admin = await registerUser();
    await addUserToOrg(org._id, admin.user.id, 'Admin');

    const res = await request(app)
      .post(`/api/organizations/${org._id}/projects`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ name: 'Admin Created This' });

    expect(res.status).toBe(201);
  });
});

describe('Unauthorized issue modification', () => {
  const setupProjectWithIssue = async () => {
    const owner = await registerUser();
    const org = await createOrganization(owner.token);

    const projectRes = await request(app)
      .post(`/api/organizations/${org._id}/projects`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ name: 'Issue Test Project' });
    const project = projectRes.body.project;

    const memberA = await registerUser();
    await addUserToOrg(org._id, memberA.user.id, 'Member');
    await request(app)
      .post(`/api/organizations/${org._id}/projects/${project._id}/members`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ userId: memberA.user.id });

    const memberB = await registerUser();
    await addUserToOrg(org._id, memberB.user.id, 'Member');
    await request(app)
      .post(`/api/organizations/${org._id}/projects/${project._id}/members`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ userId: memberB.user.id });

    const issueRes = await request(app)
      .post(`/api/organizations/${org._id}/projects/${project._id}/issues`)
      .set('Authorization', `Bearer ${memberA.token}`)
      .send({ title: 'Assigned to Member A', assignee: memberA.user.id });

    return { org, project, memberA, memberB, issue: issueRes.body.issue };
  };

  it('prevents a Member from updating an issue not assigned to them', async () => {
    const { org, project, memberB, issue } = await setupProjectWithIssue();

    const res = await request(app)
      .patch(`/api/organizations/${org._id}/projects/${project._id}/issues/${issue._id}`)
      .set('Authorization', `Bearer ${memberB.token}`)
      .send({ status: 'DONE' });

    expect(res.status).toBe(403);
  });

  it('allows the assigned Member to update their own issue', async () => {
    const { org, project, memberA, issue } = await setupProjectWithIssue();

    const res = await request(app)
      .patch(`/api/organizations/${org._id}/projects/${project._id}/issues/${issue._id}`)
      .set('Authorization', `Bearer ${memberA.token}`)
      .send({ status: 'IN_PROGRESS' });

    expect(res.status).toBe(200);
    expect(res.body.issue.status).toBe('IN_PROGRESS');
  });

  it('prevents a Member from deleting any issue, even their own', async () => {
    const { org, project, memberA, issue } = await setupProjectWithIssue();

    const res = await request(app)
      .delete(`/api/organizations/${org._id}/projects/${project._id}/issues/${issue._id}`)
      .set('Authorization', `Bearer ${memberA.token}`);

    expect(res.status).toBe(403);
  });
});