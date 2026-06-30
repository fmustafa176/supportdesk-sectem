import { useState, useEffect } from 'react';
import { getDashboard } from '../api/tickets';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>loading...</p>;
  if (!stats) return <p>failed to load stats</p>;

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Tickets</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card accent-green">
          <div className="stat-label">Open</div>
          <div className="stat-value">{stats.open}</div>
        </div>
        <div className="stat-card accent-purple">
          <div className="stat-label">In Progress</div>
          <div className="stat-value">{stats.inProgress}</div>
        </div>
        <div className="stat-card accent-green">
          <div className="stat-label">Resolved</div>
          <div className="stat-value">{stats.resolved}</div>
        </div>
        <div className="stat-card accent-danger">
          <div className="stat-label">Urgent</div>
          <div className="stat-value">{stats.urgent}</div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
