const request = require('supertest');
const app = require('../app');
const { connect, closeDatabase, clearDatabase } = require('./setup');
const { registerUser, createOrganization } = require('./helpers');

let owner, org, project;

beforeAll(async () => {
  await connect();
});

beforeEach(async () => {
  owner = await registerUser();
  org = await createOrganization(owner.token);

  const projectRes = await request(app)
    .post(`/api/organizations/${org._id}/projects`)
    .set('Authorization', `Bearer ${owner.token}`)
    .send({ name: 'Test Project' });
  project = projectRes.body.project;
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

const createIssue = (issueData) =>
  request(app)
    .post(`/api/organizations/${org._id}/projects/${project._id}/issues`)
    .set('Authorization', `Bearer ${owner.token}`)
    .send(issueData);

describe('Issue creation', () => {
  it('creates an issue with valid data', async () => {
    const res = await createIssue({ title: 'Fix login bug', priority: 'HIGH' });

    expect(res.status).toBe(201);
    expect(res.body.issue.title).toBe('Fix login bug');
    expect(res.body.issue.status).toBe('TODO');
    expect(res.body.issue.reporter).toBe(owner.user.id);
  });

  it('rejects an issue with no title', async () => {
    const res = await createIssue({ description: 'Missing a title' });
    expect(res.status).toBe(400);
  });

  it('rejects an issue with an invalid priority', async () => {
    const res = await createIssue({ title: 'Bad priority', priority: 'SUPER_URGENT' });
    expect(res.status).toBe(400);
  });
});

describe('Issue update', () => {
  it('updates an issue’s status', async () => {
    const created = await createIssue({ title: 'Track this' });
    const issueId = created.body.issue._id;

    const res = await request(app)
      .patch(`/api/organizations/${org._id}/projects/${project._id}/issues/${issueId}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ status: 'IN_PROGRESS' });

    expect(res.status).toBe(200);
    expect(res.body.issue.status).toBe('IN_PROGRESS');
  });

  it('rejects an update with an invalid status value', async () => {
    const created = await createIssue({ title: 'Track this too' });
    const issueId = created.body.issue._id;

    const res = await request(app)
      .patch(`/api/organizations/${org._id}/projects/${project._id}/issues/${issueId}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ status: 'NOT_A_REAL_STATUS' });

    expect(res.status).toBe(400);
  });

  it('returns 404 when updating a nonexistent issue', async () => {
    const fakeId = '507f1f77bcf86cd799439011';

    const res = await request(app)
      .patch(`/api/organizations/${org._id}/projects/${project._id}/issues/${fakeId}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ status: 'DONE' });

    expect(res.status).toBe(404);
  });
});

describe('Issue filtering', () => {
  beforeEach(async () => {
    await createIssue({ title: 'Low priority bug', priority: 'LOW', status: 'TODO' });
    await createIssue({ title: 'High priority feature', priority: 'HIGH', status: 'TODO' });
    await createIssue({ title: 'Critical outage', priority: 'CRITICAL', status: 'IN_PROGRESS' });
    await createIssue({ title: 'Done with this', priority: 'MEDIUM', status: 'DONE' });
  });

  const listIssues = (query) =>
    request(app)
      .get(`/api/organizations/${org._id}/projects/${project._id}/issues`)
      .query(query)
      .set('Authorization', `Bearer ${owner.token}`);

  it('returns all issues with no filters', async () => {
    const res = await listIssues({});
    expect(res.status).toBe(200);
    expect(res.body.issues.length).toBe(4);
  });

  it('filters by status', async () => {
    const res = await listIssues({ status: 'TODO' });
    expect(res.status).toBe(200);
    expect(res.body.issues.length).toBe(2);
    res.body.issues.forEach((issue) => expect(issue.status).toBe('TODO'));
  });

  it('filters by priority', async () => {
    const res = await listIssues({ priority: 'CRITICAL' });
    expect(res.status).toBe(200);
    expect(res.body.issues.length).toBe(1);
    expect(res.body.issues[0].title).toBe('Critical outage');
  });

  it('combines multiple filters', async () => {
    const res = await listIssues({ status: 'TODO', priority: 'HIGH' });
    expect(res.status).toBe(200);
    expect(res.body.issues.length).toBe(1);
    expect(res.body.issues[0].title).toBe('High priority feature');
  });

  it('searches by title text', async () => {
    const res = await listIssues({ search: 'outage' });
    expect(res.status).toBe(200);
    expect(res.body.issues.length).toBe(1);
    expect(res.body.issues[0].title).toBe('Critical outage');
  });
});

describe('Pagination', () => {
  beforeEach(async () => {
    for (let i = 1; i <= 15; i++) {
      await createIssue({ title: `Issue number ${i}` });
    }
  });

  it('returns a default page of results with pagination metadata', async () => {
    const res = await request(app)
      .get(`/api/organizations/${org._id}/projects/${project._id}/issues`)
      .set('Authorization', `Bearer ${owner.token}`);

    expect(res.status).toBe(200);
    expect(res.body.issues.length).toBe(15);
    expect(res.body.pagination.total).toBe(15);
    expect(res.body.pagination.page).toBe(1);
  });

  it('respects a custom page size', async () => {
    const res = await request(app)
      .get(`/api/organizations/${org._id}/projects/${project._id}/issues`)
      .query({ limit: 5, page: 1 })
      .set('Authorization', `Bearer ${owner.token}`);

    expect(res.status).toBe(200);
    expect(res.body.issues.length).toBe(5);
    expect(res.body.pagination.totalPages).toBe(3);
  });

  it('returns different issues on different pages', async () => {
    const page1 = await request(app)
      .get(`/api/organizations/${org._id}/projects/${project._id}/issues`)
      .query({ limit: 5, page: 1 })
      .set('Authorization', `Bearer ${owner.token}`);

    const page2 = await request(app)
      .get(`/api/organizations/${org._id}/projects/${project._id}/issues`)
      .query({ limit: 5, page: 2 })
      .set('Authorization', `Bearer ${owner.token}`);

    const page1Ids = page1.body.issues.map((i) => i._id);
    const page2Ids = page2.body.issues.map((i) => i._id);

    const overlap = page1Ids.filter((id) => page2Ids.includes(id));
    expect(overlap.length).toBe(0);
  });

  it('caps the page size at the backend-enforced maximum', async () => {
    const res = await request(app)
      .get(`/api/organizations/${org._id}/projects/${project._id}/issues`)
      .query({ limit: 999 })
      .set('Authorization', `Bearer ${owner.token}`);

    expect(res.status).toBe(200);
    expect(res.body.pagination.limit).toBe(100);
  });
});