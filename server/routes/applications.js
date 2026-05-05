import express from 'express';
import db from '../db.js';

const router = express.Router();

const VALID_STATUSES = ['Applied', 'In Review', 'Interview Scheduled', 'Offer', 'Rejected', 'Withdrawn'];

// GET all applications
router.get('/', (req, res) => {
  try {
    const { status, search } = req.query;
    let query = 'SELECT * FROM applications';
    const params = [];
    const conditions = [];

    if (status && status !== 'All') {
      conditions.push('status = ?');
      params.push(status);
    }

    if (search) {
      conditions.push('(company LIKE ? OR role LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY date_applied DESC, created_at DESC';

    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single application
router.get('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create application
router.post('/', (req, res) => {
  try {
    const { company, role, job_url, date_applied, status = 'Applied', notes, job_description, resume_snapshot } = req.body;

    if (!company || !role || !date_applied) {
      return res.status(400).json({ error: 'company, role, and date_applied are required' });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const stmt = db.prepare(`
      INSERT INTO applications (company, role, job_url, date_applied, status, notes, job_description, resume_snapshot)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(company, role, job_url || null, date_applied, status, notes || null, job_description || null, resume_snapshot || null);
    const created = db.prepare('SELECT * FROM applications WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update application
router.put('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });

    const { company, role, job_url, date_applied, status, notes, job_description, resume_snapshot } = req.body;

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updated = {
      company: company ?? existing.company,
      role: role ?? existing.role,
      job_url: job_url ?? existing.job_url,
      date_applied: date_applied ?? existing.date_applied,
      status: status ?? existing.status,
      notes: notes ?? existing.notes,
      job_description: job_description ?? existing.job_description,
      resume_snapshot: resume_snapshot ?? existing.resume_snapshot,
    };

    db.prepare(`
      UPDATE applications
      SET company = ?, role = ?, job_url = ?, date_applied = ?, status = ?,
          notes = ?, job_description = ?, resume_snapshot = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(updated.company, updated.role, updated.job_url, updated.date_applied, updated.status, updated.notes, updated.job_description, updated.resume_snapshot, req.params.id);

    const result = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE application
router.delete('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    db.prepare('DELETE FROM applications WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
