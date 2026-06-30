import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTicket, updateTicketStatus, getCustomerTickets, deleteTicket } from '../api/tickets';

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

  async function handleDelete() {
    if (window.confirm('Are you sure you want to delete this ticket? This cannot be undone.')) {
      try {
        await deleteTicket(ticket.id);
        navigate('/tickets');
      } catch (err) {
        alert('failed to delete ticket');
      }
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
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={handleDelete} style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>
            Delete
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/tickets')}>
            Back to list
          </button>
        </div>
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
              <div className="status-slider" style={{ marginTop: 8 }}>
                <div 
                  className="slider-bg" 
                  style={{ 
                    transform: `translateX(${ticket.status === 'Open' ? '0%' : ticket.status === 'In Progress' ? '100%' : '200%'})`,
                    backgroundColor: ticket.status === 'Open' ? '#3b82f6' : ticket.status === 'In Progress' ? '#f59e0b' : '#10b981'
                  }} 
                />
                <button 
                  className={`slider-option ${ticket.status === 'Open' ? 'active' : ''}`}
                  onClick={() => handleStatusChange('Open')}
                  disabled={updating}
                >
                  Open
                </button>
                <button 
                  className={`slider-option ${ticket.status === 'In Progress' ? 'active' : ''}`}
                  onClick={() => handleStatusChange('In Progress')}
                  disabled={updating}
                >
                  In Progress
                </button>
                <button 
                  className={`slider-option ${ticket.status === 'Resolved' ? 'active' : ''}`}
                  onClick={() => handleStatusChange('Resolved')}
                  disabled={updating}
                >
                  Resolved
                </button>
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
