const BASE = '/api';

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// Applications
export const getApplications = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request('GET', `/applications${qs ? '?' + qs : ''}`);
};
export const getApplication = (id) => request('GET', `/applications/${id}`);
export const createApplication = (data) => request('POST', '/applications', data);
export const updateApplication = (id, data) => request('PUT', `/applications/${id}`, data);
export const deleteApplication = (id) => request('DELETE', `/applications/${id}`);

// AI
export const analyzeResume = (data) => request('POST', '/ai/analyze', data);
export const generateCoverLetter = (data) => request('POST', '/ai/cover-letter', data);
export const getInterviewPrep = (data) => request('POST', '/ai/interview-prep', data);
export const getInsights = () => request('POST', '/ai/insights', {});
