import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { getApplication, updateApplication, deleteApplication, generateCoverLetter, getInterviewPrep } from '../api.js';
import StatusBadge, { ALL_STATUSES } from '../components/StatusBadge.jsx';
import Modal from '../components/Modal.jsx';
import ApplicationForm from '../components/ApplicationForm.jsx';
import './AppDetail.css';

export default function AppDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  // AI state
  const [resume, setResume] = useState('');
  const [aiTab, setAiTab] = useState('cover-letter');
  const [aiLoading, setAiLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [interviewPrep, setInterviewPrep] = useState(null);
  const [coverNotes, setCoverNotes] = useState('');

  useEffect(() => {
    getApplication(id)
      .then(setApp)
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleEdit = async (form) => {
    setSaving(true);
    try {
      const updated = await updateApplication(id, form);
      setApp(updated);
      toast.success('Saved');
      setShowEdit(false);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this application?')) return;
    await deleteApplication(id);
    toast.success('Deleted');
    navigate('/dashboard');
  };

  const handleStatusChange = async (e) => {
    const status = e.target.value;
    try {
      const updated = await updateApplication(id, { status });
      setApp(updated);
      toast.success(`Status → ${status}`);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleCoverLetter = async () => {
    if (!resume.trim()) { toast.error('Paste your resume first'); return; }
    setAiLoading(true);
    try {
      const data = await generateCoverLetter({ application_id: Number(id), resume, custom_notes: coverNotes });
      setCoverLetter(data.cover_letter);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleInterviewPrep = async () => {
    setAiLoading(true);
    try {
      const data = await getInterviewPrep({ application_id: Number(id), resume });
      setInterviewPrep(data);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setAiLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (loading) return <div className="loading-state"><span className="spinner" style={{ width: 28, height: 28 }} /></div>;
  if (!app) return null;

  return (
    <div className="appdetail">
      {/* Header */}
      <div className="detail-header">
        <button className="btn btn-ghost back-btn" onClick={() => navigate('/dashboard')}>← Back</button>
        <div className="detail-title-row">
          <div>
            <h1 className="detail-company">{app.company}</h1>
            <p className="detail-role">{app.role}</p>
          </div>
          <div className="detail-actions">
            <select className="status-select" value={app.status} onChange={handleStatusChange}>
              {ALL_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <button className="btn btn-secondary" onClick={() => setShowEdit(true)}>Edit</button>
            <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
          </div>
        </div>
        <div className="detail-meta">
          <StatusBadge status={app.status} />
          <span className="meta-item">Applied {format(new Date(app.date_applied), 'MMM d, yyyy')}</span>
          {app.job_url && <a href={app.job_url} target="_blank" rel="noopener noreferrer" className="meta-link">View Job Posting ↗</a>}
        </div>
      </div>

      <div className="detail-body">
        {/* Left column */}
        <div className="detail-left">
          {app.notes && (
            <div className="card detail-section">
              <h3 className="section-title">Notes</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-mid)', whiteSpace: 'pre-wrap' }}>{app.notes}</p>
            </div>
          )}

          {app.job_description && (
            <div className="card detail-section">
              <h3 className="section-title">Job Description</h3>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-dim)', whiteSpace: 'pre-wrap', maxHeight: 300, overflowY: 'auto' }}>{app.job_description}</p>
            </div>
          )}
        </div>

        {/* Right column — AI Panel */}
        <div className="detail-right">
          <div className="card ai-panel">
            <div className="ai-panel-header">
              <span className="ai-badge">⚡ AI Powered</span>
              <h3 className="section-title" style={{ marginTop: 8 }}>Smart Tools</h3>
            </div>

            <div className="ai-tabs">
              {['cover-letter', 'interview-prep'].map((t) => (
                <button key={t} className={`ai-tab ${aiTab === t ? 'ai-tab-active' : ''}`} onClick={() => setAiTab(t)}>
                  {t === 'cover-letter' ? '✉️ Cover Letter' : '🎯 Interview Prep'}
                </button>
              ))}
            </div>

            {/* Resume input (shared) */}
            <div className="form-group" style={{ marginTop: 14 }}>
              <label>Your Resume / Background</label>
              <textarea
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                placeholder="Paste your resume or key experience here…"
                style={{ minHeight: 100 }}
              />
            </div>

            {aiTab === 'cover-letter' && (
              <>
                <div className="form-group" style={{ marginTop: 10 }}>
                  <label>Additional Context (optional)</label>
                  <textarea
                    value={coverNotes}
                    onChange={(e) => setCoverNotes(e.target.value)}
                    placeholder="e.g. I know their CTO via LinkedIn, huge fan of their product…"
                    style={{ minHeight: 60 }}
                  />
                </div>
                <button className="btn btn-primary" style={{ marginTop: 12, width: '100%' }} onClick={handleCoverLetter} disabled={aiLoading}>
                  {aiLoading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Generating…</> : 'Generate Cover Letter'}
                </button>
                {coverLetter && (
                  <div className="ai-result" style={{ position: 'relative' }}>
                    <button
                      className="btn btn-ghost copy-btn"
                      onClick={() => copyToClipboard(coverLetter)}
                      style={{ position: 'absolute', top: 8, right: 8, fontSize: 12 }}
                    >
                      Copy
                    </button>
                    {coverLetter}
                  </div>
                )}
              </>
            )}

            {aiTab === 'interview-prep' && (
              <>
                <button className="btn btn-primary" style={{ marginTop: 12, width: '100%' }} onClick={handleInterviewPrep} disabled={aiLoading}>
                  {aiLoading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Generating…</> : 'Generate Interview Questions'}
                </button>
                {interviewPrep && !interviewPrep.raw && (
                  <div className="ai-result interview-result">
                    {interviewPrep.behavioral?.length > 0 && (
                      <><h4>Behavioral</h4>{interviewPrep.behavioral.map((q, i) => (
                        <div key={i} className="qa-item">
                          <p className="qa-q">Q: {q.question}</p>
                          {q.hint && <p className="qa-hint">💡 {q.hint}</p>}
                        </div>
                      ))}</>
                    )}
                    {interviewPrep.technical?.length > 0 && (
                      <><h4>Technical</h4>{interviewPrep.technical.map((q, i) => (
                        <div key={i} className="qa-item">
                          <p className="qa-q">Q: {q.question}</p>
                          {q.hint && <p className="qa-hint">💡 {q.hint}</p>}
                        </div>
                      ))}</>
                    )}
                    {interviewPrep.company_culture?.length > 0 && (
                      <><h4>Culture Fit</h4>{interviewPrep.company_culture.map((q, i) => (
                        <div key={i} className="qa-item">
                          <p className="qa-q">Q: {q.question}</p>
                          {q.hint && <p className="qa-hint">💡 {q.hint}</p>}
                        </div>
                      ))}</>
                    )}
                    {interviewPrep.questions_to_ask?.length > 0 && (
                      <><h4>Ask Them</h4><ul style={{ paddingLeft: 18 }}>
                        {interviewPrep.questions_to_ask.map((q, i) => <li key={i}>{q}</li>)}
                      </ul></>
                    )}
                  </div>
                )}
                {interviewPrep?.raw && <div className="ai-result">{interviewPrep.raw}</div>}
              </>
            )}
          </div>
        </div>
      </div>

      {showEdit && (
        <Modal title="Edit Application" onClose={() => setShowEdit(false)}>
          <ApplicationForm
            initial={{
              company: app.company,
              role: app.role,
              job_url: app.job_url || '',
              date_applied: app.date_applied,
              status: app.status,
              notes: app.notes || '',
              job_description: app.job_description || '',
            }}
            onSubmit={handleEdit}
            onCancel={() => setShowEdit(false)}
            loading={saving}
          />
        </Modal>
      )}
    </div>
  );
}
