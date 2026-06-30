const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { ticketValidation, statusValidation, validate } = require('../middleware/validation');

// figure out if a ticket should be marked urgent
function checkUrgent(priority, description) {
  if (priority === 'High') return true;
  if (description && description.toLowerCase().includes('urgent')) return true;
  return false;
}

// POST /api/tickets - create a new ticket
router.post('/', ticketValidation, validate, (req, res) => {
  try {
    const { customer_name, customer_email, subject, description, priority } = req.body;
    const is_urgent = checkUrgent(priority, description) ? 1 : 0;

    const stmt = db.prepare(`
      INSERT INTO tickets (customer_name, customer_email, subject, description, priority, is_urgent)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(customer_name, customer_email, subject, description, priority, is_urgent);
    const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'failed to create ticket' });
  }
});

// GET /api/tickets - list tickets with search, filter, sort, pagination
router.get('/', (req, res) => {
  try {
    const { search, priority, status, sort, page = 1, limit = 10 } = req.query;

    let query = 'SELECT * FROM tickets WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM tickets WHERE 1=1';
    const params = [];
    const countParams = [];

    // search across name, email, subject
    if (search) {
      const searchClause = ' AND (customer_name LIKE ? OR customer_email LIKE ? OR subject LIKE ?)';
      query += searchClause;
      countQuery += searchClause;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (priority) {
      query += ' AND priority = ?';
      countQuery += ' AND priority = ?';
      params.push(priority);
      countParams.push(priority);
    }

    if (status) {
      query += ' AND status = ?';
      countQuery += ' AND status = ?';
      params.push(status);
      countParams.push(status);
    }

    // sort by created_at, default newest first
    const sortOrder = sort === 'oldest' ? 'ASC' : 'DESC';
    query += ` ORDER BY created_at ${sortOrder}`;

    // pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;
    query += ' LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const tickets = db.prepare(query).all(...params);
    const { total } = db.prepare(countQuery).get(...countParams);

    res.json({
      tickets,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'failed to fetch tickets' });
  }
});

// GET /api/tickets/customer/:email - get all tickets from the same customer
// this is the linking approach for duplicate emails: we group tickets by email
router.get('/customer/:email', (req, res) => {
  try {
    const tickets = db.prepare(
      'SELECT * FROM tickets WHERE customer_email = ? ORDER BY created_at DESC'
    ).all(req.params.email);
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: 'failed to fetch customer tickets' });
  }
});

// GET /api/tickets/:id - get a single ticket
router.get('/:id', (req, res) => {
  try {
    const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'ticket not found' });
    }
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'failed to fetch ticket' });
  }
});

// PATCH /api/tickets/:id/status - update ticket status
router.patch('/:id/status', statusValidation, validate, (req, res) => {
  try {
    const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'ticket not found' });
    }

    const { status } = req.body;
    db.prepare(`
      UPDATE tickets SET status = ?, updated_at = datetime('now') WHERE id = ?
    `).run(status, req.params.id);

    const updated = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'failed to update status' });
  }
});


module.exports = router;
