const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/dashboard - ticket statistics
router.get('/', (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM tickets').get().count;
    const open = db.prepare("SELECT COUNT(*) as count FROM tickets WHERE status = 'Open'").get().count;
    const inProgress = db.prepare("SELECT COUNT(*) as count FROM tickets WHERE status = 'In Progress'").get().count;
    const resolved = db.prepare("SELECT COUNT(*) as count FROM tickets WHERE status = 'Resolved'").get().count;
    const urgent = db.prepare('SELECT COUNT(*) as count FROM tickets WHERE is_urgent = 1').get().count;

    res.json({ total, open, inProgress, resolved, urgent });
  } catch (err) {
    res.status(500).json({ error: 'failed to fetch stats' });
  }
});

module.exports = router;
