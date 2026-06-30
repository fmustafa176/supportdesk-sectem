const BASE_URL = 'http://localhost:3001/api';

async function request(url, options = {}) {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

export function getTickets(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/tickets?${query}`);
}

export function getTicket(id) {
  return request(`/tickets/${id}`);
}

export function createTicket(ticket) {
  return request('/tickets', {
    method: 'POST',
    body: JSON.stringify(ticket),
  });
}

export function updateTicketStatus(id, status) {
  return request(`/tickets/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function getCustomerTickets(email) {
  return request(`/tickets/customer/${encodeURIComponent(email)}`);
}

export function getDashboard() {
  return request('/dashboard');
}
