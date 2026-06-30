const express = require('express');
const cors = require('cors');
const ticketRoutes = require('./routes/tickets');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/tickets', ticketRoutes);
app.use('/api/dashboard', dashboardRoutes);

// basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// only start listening if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n===========================================`);
    console.log(`🚀 Backend running at: http://localhost:${PORT}`);
    console.log(`===========================================\n`);
  });
}

module.exports = app;
