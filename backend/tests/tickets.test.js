const request = require('supertest');
const app = require('../src/index');
const db = require('../src/db/database');

// clean the table before each test
beforeEach(() => {
  db.exec('DELETE FROM tickets');
});

afterAll(() => {
  db.close();
});

describe('ticket creation and validation', () => {
  test('should reject ticket with missing name', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({
        customer_email: 'test@example.com',
        subject: 'test subject',
        description: 'this is a test description long enough',
        priority: 'Low',
      });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].msg).toContain('customer name is required');
  });

  test('should reject ticket with invalid email', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({
        customer_name: 'John',
        customer_email: 'not-an-email',
        subject: 'test',
        description: 'this is a valid test description',
        priority: 'Low',
      });

    expect(res.status).toBe(400);
    expect(res.body.errors.some(e => e.msg.includes('valid email'))).toBe(true);
  });

  test('should reject ticket with short description', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({
        customer_name: 'John',
        customer_email: 'john@test.com',
        subject: 'test',
        description: 'short',
        priority: 'Low',
      });

    expect(res.status).toBe(400);
    expect(res.body.errors.some(e => e.msg.includes('at least 10'))).toBe(true);
  });

  test('should reject ticket with invalid priority', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({
        customer_name: 'John',
        customer_email: 'john@test.com',
        subject: 'test',
        description: 'this is a valid description',
        priority: 'Critical',
      });

    expect(res.status).toBe(400);
    expect(res.body.errors.some(e => e.msg.includes('Low, Medium, or High'))).toBe(true);
  });

  test('should create a valid ticket', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({
        customer_name: 'Jane Doe',
        customer_email: 'jane@example.com',
        subject: 'need help',
        description: 'this is a longer description for testing',
        priority: 'Medium',
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.status).toBe('Open');
    expect(res.body.is_urgent).toBe(0);
  });
});

describe('urgent ticket detection', () => {
  test('should mark high priority tickets as urgent', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({
        customer_name: 'Alice',
        customer_email: 'alice@example.com',
        subject: 'server down',
        description: 'the production server is not responding',
        priority: 'High',
      });

    expect(res.status).toBe(201);
    expect(res.body.is_urgent).toBe(1);
  });

  test('should mark tickets with "urgent" in description as urgent', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({
        customer_name: 'Bob',
        customer_email: 'bob@example.com',
        subject: 'login issue',
        description: 'this is URGENT, i cannot log in at all',
        priority: 'Low',
      });

    expect(res.status).toBe(201);
    expect(res.body.is_urgent).toBe(1);
  });

  test('should not mark normal tickets as urgent', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({
        customer_name: 'Charlie',
        customer_email: 'charlie@example.com',
        subject: 'question about billing',
        description: 'just a simple billing question here',
        priority: 'Low',
      });

    expect(res.status).toBe(201);
    expect(res.body.is_urgent).toBe(0);
  });
});

describe('status updates', () => {
  test('should update ticket status', async () => {
    const create = await request(app)
      .post('/api/tickets')
      .send({
        customer_name: 'Dave',
        customer_email: 'dave@example.com',
        subject: 'feature request',
        description: 'would be nice to have dark mode support',
        priority: 'Low',
      });

    const res = await request(app)
      .patch(`/api/tickets/${create.body.id}/status`)
      .send({ status: 'In Progress' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('In Progress');
    expect(res.body.updated_at).toBeDefined();
  });

  test('should reject invalid status values', async () => {
    const create = await request(app)
      .post('/api/tickets')
      .send({
        customer_name: 'Eve',
        customer_email: 'eve@example.com',
        subject: 'bug report',
        description: 'something is broken in the dashboard',
        priority: 'Medium',
      });

    const res = await request(app)
      .patch(`/api/tickets/${create.body.id}/status`)
      .send({ status: 'Closed' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test('should return 404 for non-existent ticket', async () => {
    const res = await request(app)
      .patch('/api/tickets/9999/status')
      .send({ status: 'Resolved' });

    expect(res.status).toBe(404);
  });
});
