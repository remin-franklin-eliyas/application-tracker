import { useState } from 'react';
import toast from 'react-hot-toast';
import { analyzeResume } from '../api.js';
import './Analyzer.css';

export default function Analyzer() {
  const [resume, setResume] = useState('');
  const [jd, setJd] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!resume.trim() || !jd.trim()) {
      toast.error('Paste both your resume and the job description');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const data = await analyzeResume({ resume, job_description: jd, company, role });
      setResult(data);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const LABEL_COLOR = {
    Weak: '#ef4444', Fair: '#f59e0b', Good: '#3b82f6', Strong: '#8b5cf6', Excellent: '#22c55e'
  };

  return (
    <div className="analyzer">
      <div className="analyzer-header">
        <h1>Resume Analyzer</h1>
        <p className="analyzer-sub">Paste your resume and a job description to get an AI-powered match score, gaps, and action items.</p>
      </div>

      <div className="analyzer-inputs">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label>Company (optional)</label>
            <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Red Bull Racing" />
          </div>
          <div className="form-group">
            <label>Role (optional)</label>
            <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Software Engineer" />
          </div>
        </div>

        <div className="analyzer-textareas">
          <div className="form-group">
            <label>Your Resume</label>
            <textarea
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Paste your full resume here…"
              className="big-textarea"
            />
          </div>
          <div className="form-group">
            <label>Job Description</label>
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the full job description here…"
              className="big-textarea"
            />
          </div>
        </div>

        <button className="btn btn-primary" style={{ alignSelf: 'flex-end', minWidth: 180 }} onClick={handleAnalyze} disabled={loading}>
          {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Analyzing…</> : '⚡ Analyze Match'}
        </button>
      </div>

      {result && !result.raw && (
        <div className="analyzer-result card">
          {/* Score */}
          <div className="score-row">
            <div className="score-circle" style={{ '--score-color': LABEL_COLOR[result.match_label] || '#888' }}>
              <span className="score-num">{result.match_score}</span>
              <span className="score-pct">%</span>
            </div>
            <div>
              <div className="score-label" style={{ color: LABEL_COLOR[result.match_label] || '#888' }}>
                {result.match_label} Match
              </div>
              {result.summary && <p style={{ fontSize: 14, color: 'var(--text-mid)', marginTop: 6, maxWidth: 560 }}>{result.summary}</p>}
            </div>
          </div>

          <div className="result-cols">
            {result.strengths?.length > 0 && (
              <div className="result-col">
                <h4 className="result-col-title" style={{ color: '#22c55e' }}>✓ Strengths</h4>
                <ul>{result.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>
            )}
            {result.gaps?.length > 0 && (
              <div className="result-col">
                <h4 className="result-col-title" style={{ color: '#ef4444' }}>✗ Gaps</h4>
                <ul>{result.gaps.map((g, i) => <li key={i}>{g}</li>)}</ul>
              </div>
            )}
            {result.recommendations?.length > 0 && (
              <div className="result-col">
                <h4 className="result-col-title" style={{ color: '#f59e0b' }}>→ Actions</h4>
                <ul>{result.recommendations.map((r, i) => <li key={i}>{r}</li>)}</ul>
              </div>
            )}
          </div>
        </div>
      )}

      {result?.raw && (
        <div className="card ai-result">{result.raw}</div>
      )}
    </div>
  );
}
