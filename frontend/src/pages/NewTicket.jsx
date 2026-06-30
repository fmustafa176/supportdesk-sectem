import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket } from '../api/tickets';

function NewTicket() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    subject: '',
    description: '',
    priority: 'Low',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }

  function validate() {
    const errs = {};
    if (!form.customer_name.trim()) errs.customer_name = 'name is required';
    if (!form.customer_email.trim()) {
      errs.customer_email = 'email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customer_email)) {
      errs.customer_email = 'must be a valid email';
    }
    if (!form.subject.trim()) errs.subject = 'subject is required';
    if (!form.description.trim()) {
      errs.description = 'description is required';
    } else if (form.description.trim().length < 10) {
      errs.description = 'description must be at least 10 characters';
    }
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setServerError('');

    try {
      const ticket = await createTicket(form);
      navigate(`/tickets/${ticket.id}`);
    } catch (err) {
      if (err.errors) {
        // map backend validation errors
        const mapped = {};
        err.errors.forEach((e) => {
          if (e.path) mapped[e.path] = e.msg;
        });
        setErrors(mapped);
      } else {
        setServerError('something went wrong, try again');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>New Ticket</h2>
      </div>
      <div className="card" style={{ maxWidth: 600 }}>
        {serverError && (
          <p style={{ color: 'var(--danger)', marginBottom: 16, fontSize: 14 }}>{serverError}</p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="customer_name">Customer Name</label>
            <input
              id="customer_name"
              name="customer_name"
              value={form.customer_name}
              onChange={handleChange}
              placeholder="enter customer name"
            />
            {errors.customer_name && <p className="error-msg">{errors.customer_name}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="customer_email">Customer Email</label>
            <input
              id="customer_email"
              name="customer_email"
              type="email"
              value={form.customer_email}
              onChange={handleChange}
              placeholder="enter customer email"
            />
            {errors.customer_email && <p className="error-msg">{errors.customer_email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              id="subject"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="brief subject of the issue"
            />
            {errors.subject && <p className="error-msg">{errors.subject}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="describe the issue in detail (min 10 chars)"
            />
            {errors.description && <p className="error-msg">{errors.description}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={form.priority}
              onChange={handleChange}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Ticket'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/tickets')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewTicket;
