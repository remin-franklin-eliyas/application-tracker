import { useState } from 'react';
import { ALL_STATUSES } from './StatusBadge.jsx';

const EMPTY = {
  company: '', role: '', job_url: '', date_applied: new Date().toISOString().split('T')[0],
  status: 'Applied', notes: '', job_description: '',
};

export default function ApplicationForm({ initial = {}, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.company.trim() || !form.role.trim() || !form.date_applied) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="form-group">
          <label>Company *</label>
          <input value={form.company} onChange={set('company')} placeholder="e.g. Ferrari" required />
        </div>
        <div className="form-group">
          <label>Role *</label>
          <input value={form.role} onChange={set('role')} placeholder="e.g. Front-End Engineer" required />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="form-group">
          <label>Date Applied *</label>
          <input type="date" value={form.date_applied} onChange={set('date_applied')} required />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select value={form.status} onChange={set('status')}>
            {ALL_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Job URL</label>
        <input type="url" value={form.job_url} onChange={set('job_url')} placeholder="https://..." />
      </div>

      <div className="form-group">
        <label>Job Description (used for AI features)</label>
        <textarea value={form.job_description} onChange={set('job_description')} placeholder="Paste the full job description here..." style={{ minHeight: 120 }} />
      </div>

      <div className="form-group">
        <label>Notes</label>
        <textarea value={form.notes} onChange={set('notes')} placeholder="Referrals, contacts, interview details..." />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Saving…</> : 'Save Application'}
        </button>
      </div>
    </form>
  );
}
