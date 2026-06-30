import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getTickets } from '../api/tickets';

function TicketList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // read filters from url
  const search = searchParams.get('search') || '';
  const priority = searchParams.get('priority') || '';
  const status = searchParams.get('status') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (search) params.search = search;
    if (priority) params.priority = priority;
    if (status) params.status = status;
    if (sort) params.sort = sort;

    getTickets(params)
      .then((data) => {
        setTickets(data.tickets);
        setPagination(data.pagination);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, priority, status, sort, page]);

  function updateFilter(key, value) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // reset page when changing filters
    if (key !== 'page') params.set('page', '1');
    setSearchParams(params);
  }

  function getPriorityBadge(p) {
    const cls = p === 'High' ? 'badge-high' : p === 'Medium' ? 'badge-medium' : 'badge-low';
    return <span className={`badge ${cls}`}>{p}</span>;
  }

  function getStatusBadge(s) {
    const cls = s === 'Open' ? 'badge-open' : s === 'In Progress' ? 'badge-progress' : 'badge-resolved';
    return <span className={`badge ${cls}`}>{s}</span>;
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Tickets</h2>
        <button className="btn btn-primary" onClick={() => navigate('/tickets/new')}>
          New Ticket
        </button>
      </div>

      <div className="filters-bar">
        <input
          type="text"
          placeholder="search by name, email or subject..."
          value={search}
          onChange={(e) => updateFilter('search', e.target.value)}
        />
        <select value={priority} onChange={(e) => updateFilter('priority', e.target.value)}>
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <select value={status} onChange={(e) => updateFilter('status', e.target.value)}>
          <option value="">All Status</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
        <select value={sort} onChange={(e) => updateFilter('sort', e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <p>loading...</p>
        ) : tickets.length === 0 ? (
          <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            no tickets found
          </p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Subject</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id} className="clickable" onClick={() => navigate(`/tickets/${t.id}`)}>
                    <td>#{t.id}</td>
                    <td>{t.customer_name}</td>
                    <td>
                      {t.subject}
                      {t.is_urgent ? <span className="badge badge-urgent" style={{ marginLeft: 8 }}>URGENT</span> : null}
                    </td>
                    <td>{getPriorityBadge(t.priority)}</td>
                    <td>{getStatusBadge(t.status)}</td>
                    <td>{new Date(t.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); navigate(`/tickets/${t.id}`); }}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={pagination.page <= 1}
            onClick={() => updateFilter('page', String(pagination.page - 1))}
          >
            Prev
          </button>
          <span>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} tickets)
          </span>
          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => updateFilter('page', String(pagination.page + 1))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default TicketList;
