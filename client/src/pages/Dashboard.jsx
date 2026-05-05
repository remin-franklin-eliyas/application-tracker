import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { getApplications, createApplication, deleteApplication, getInsights } from '../api.js';
import StatusBadge, { ALL_STATUSES, STATUS_CONFIG } from '../components/StatusBadge.jsx';
import Modal from '../components/Modal.jsx';
import ApplicationForm from '../components/ApplicationForm.jsx';
import './Dashboard.css';

const STAT_CARDS = [
  { label: 'Total', key: 'total', color: '#e10600' },
  { label: 'Interviews', key: 'Interview Scheduled', color: '#8b5cf6' },
  { label: 'Offers', key: 'Offer', color: '#22c55e' },
  { label: 'Rejected', key: 'Rejected', color: '#ef4444' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const params = {};
      if (filterStatus !== 'All') params.status = filterStatus;
      if (search.trim()) params.search = search.trim();
      const data = await getApplications(params);
      setApps(data);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, search]);

  useEffect(() => { load(); }, [load]);

  // All apps unfiltered for stat cards
  const [allApps, setAllApps] = useState([]);
  useEffect(() => {
    getApplications().then(setAllApps).catch(() => {});
  }, [apps]);

  const stats = STAT_CARDS.map((s) => ({
    ...s,
    count: s.key === 'total' ? allApps.length : allApps.filter((a) => a.status === s.key).length,
  }));

  const handleAdd = async (form) => {
    setSaving(true);
    try {
      await createApplication(form);
      toast.success('Application added!');
      setShowAdd(false);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this application?')) return;
    try {
      await deleteApplication(id);
      toast.success('Deleted');
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const loadInsights = async () => {
    setInsightsLoading(true);
    try {
      const data = await getInsights();
      setInsights(data);
    } catch (e) {
      toast.error('AI Insights: ' + e.message);
    } finally {
      setInsightsLoading(false);
    }
  };

  const INSIGHT_ICONS = { follow_up: '🔔', stale: '⏱️', positive: '🏆', warning: '⚠️', tip: '💡' };
  const HEALTH_COLOR = { Struggling: '#ef4444', Building: '#f59e0b', Active: '#3b82f6', Strong: '#22c55e' };

  return (
    <div className="dashboard">
      {/* Stat cards */}
      <div className="stat-grid">
        {stats.map((s) => (
          <div key={s.key} className="stat-card card card-accented" style={{ '--accent': s.color }}>
            <div className="stat-count" style={{ color: s.color }}>{s.count}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* AI Insights bar */}
      <div className="insights-bar card">
        <div className="insights-bar-left">
          <span className="insights-title">🤖 AI Insights</span>
          {insights?.pipeline_health && (
            <span className="badge" style={{ background: 'transparent', border: `1px solid ${HEALTH_COLOR[insights.pipeline_health] || '#888'}`, color: HEALTH_COLOR[insights.pipeline_health] || '#888' }}>
              {insights.pipeline_health}
            </span>
          )}
          {insights?.summary && <p className="insights-summary">{insights.summary}</p>}
        </div>
        <button className="btn btn-secondary" onClick={loadInsights} disabled={insightsLoading}>
          {insightsLoading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Analyzing…</> : 'Get Insights'}
        </button>
      </div>

      {insights?.insights?.length > 0 && (
        <div className="insights-list">
          {insights.insights.map((ins, i) => (
            <div key={i} className="insight-item">
              <span>{INSIGHT_ICONS[ins.type] || '•'}</span>
              <span>{ins.message}</span>
            </div>
          ))}
          {insights.recommended_action && (
            <div className="insight-action">
              <strong>Next move:</strong> {insights.recommended_action}
            </div>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-wrap">
          <input
            className="search-input"
            placeholder="Search company or role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-chips">
          {['All', ...ALL_STATUSES].map((s) => (
            <button
              key={s}
              className={`chip ${filterStatus === s ? 'chip-active' : ''}`}
              onClick={() => setFilterStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          + New Application
        </button>
      </div>

      {/* Applications table */}
      {loading ? (
        <div className="loading-state"><span className="spinner" style={{ width: 28, height: 28 }} /></div>
      ) : apps.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏁</div>
          <h3>No applications yet</h3>
          <p>Add your first application to get started</p>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Application</button>
        </div>
      ) : (
        <div className="app-table-wrap">
          <table className="app-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Role</th>
                <th>Status</th>
                <th>Applied</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => (
                <tr key={app.id} className="app-row" onClick={() => navigate(`/applications/${app.id}`)}>
                  <td className="td-company">
                    <span className="company-dot" style={{ background: STATUS_CONFIG[app.status]?.dot }} />
                    {app.company}
                  </td>
                  <td className="td-role">{app.role}</td>
                  <td><StatusBadge status={app.status} /></td>
                  <td className="td-date">
                    <span title={app.date_applied}>
                      {formatDistanceToNow(new Date(app.date_applied), { addSuffix: true })}
                    </span>
                  </td>
                  <td className="td-notes">{app.notes ? app.notes.slice(0, 60) + (app.notes.length > 60 ? '…' : '') : <span style={{ color: 'var(--text-dim)' }}>—</span>}</td>
                  <td>
                    <button className="btn btn-ghost" onClick={(e) => handleDelete(e, app.id)} title="Delete">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <Modal title="New Application" onClose={() => setShowAdd(false)}>
          <ApplicationForm onSubmit={handleAdd} onCancel={() => setShowAdd(false)} loading={saving} />
        </Modal>
      )}
    </div>
  );
}
