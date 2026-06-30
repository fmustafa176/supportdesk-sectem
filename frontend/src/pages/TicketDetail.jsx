import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTicket, updateTicketStatus, getCustomerTickets } from '../api/tickets';

function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState(null);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTicketAndHistory();
  }, [id]);

  async function loadTicketAndHistory() {
    setLoading(true);
    setError('');
    try {
      const data = await getTicket(id);
      setTicket(data);
      
      // now fetch history
      const history = await getCustomerTickets(data.customer_email);
      // filter out the current ticket from history
      setCustomerHistory(history.filter(t => t.id !== data.id));
    } catch (err) {
      console.error(err);
      setError('failed to load ticket');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(newStatus) {
    if (newStatus === ticket.status) return;
    setUpdating(true);
    try {
      const updated = await updateTicketStatus(ticket.id, newStatus);
      setTicket(updated);
    } catch (err) {
      alert('failed to update status');
    } finally {
      setUpdating(false);
    }
  }

  function getPriorityBadge(p) {
    const cls = p === 'High' ? 'badge-high' : p === 'Medium' ? 'badge-medium' : 'badge-low';
    return <span className={`badge ${cls}`}>{p}</span>;
  }

  function getStatusBadge(s) {
    const cls = s === 'Open' ? 'badge-open' : s === 'In Progress' ? 'badge-progress' : 'badge-resolved';
    return <span className={`badge ${cls}`}>{s}</span>;
  }

  if (loading) return <p>loading...</p>;
  if (error) return <p style={{ color: 'var(--danger)' }}>{error}</p>;
  if (!ticket) return null;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2>Ticket #{ticket.id}</h2>
          {ticket.is_urgent ? <span className="badge badge-urgent">URGENT</span> : null}
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/tickets')}>
          Back to list
        </button>
      </div>

      <div className="detail-grid">
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Details</h3>
          
          <div className="detail-item" style={{ marginBottom: 16 }}>
            <label>Subject</label>
            <p style={{ fontWeight: 600 }}>{ticket.subject}</p>
          </div>

          <div className="detail-item" style={{ marginBottom: 16 }}>
            <label>Description</label>
            <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>
              {ticket.description}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
            <div className="detail-item">
              <label>Created At</label>
              <p>{new Date(ticket.created_at).toLocaleString()}</p>
            </div>
            <div className="detail-item">
              <label>Updated At</label>
              <p>{new Date(ticket.updated_at).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Customer Info</h3>
            <div className="detail-item" style={{ marginBottom: 12 }}>
              <label>Name</label>
              <p>{ticket.customer_name}</p>
            </div>
            <div className="detail-item">
              <label>Email</label>
              <p>{ticket.customer_email}</p>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Properties</h3>
            
            <div className="detail-item" style={{ marginBottom: 16 }}>
              <label>Priority</label>
              <p>{getPriorityBadge(ticket.priority)}</p>
            </div>

            <div className="detail-item">
              <label>Status</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                {getStatusBadge(ticket.status)}
                <select 
                  value={ticket.status} 
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updating}
                  style={{ padding: '4px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
                {updating && <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>saving...</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card customer-history">
        <h3>Other Tickets from this Customer</h3>
        {customerHistory.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>no other tickets found.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {customerHistory.map(th => (
                  <tr key={th.id} className="clickable" onClick={() => navigate(`/tickets/${th.id}`)}>
                    <td>#{th.id}</td>
                    <td>{th.subject}</td>
                    <td>{getStatusBadge(th.status)}</td>
                    <td>{new Date(th.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default TicketDetail;
