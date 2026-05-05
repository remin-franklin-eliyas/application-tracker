import express from 'express';
import OpenAI from 'openai';
import db from '../db.js';

const router = express.Router();

function getClient() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN is not set. Add it to server/.env');
  return new OpenAI({
    apiKey: token,
    baseURL: 'https://models.inference.ai.azure.com',
  });
}

async function callModel(messages, temperature = 0.7) {
  const client = getClient();
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages,
    temperature,
  });
  return response.choices[0].message.content;
}

// POST /api/ai/analyze — Resume vs JD match analysis
router.post('/analyze', async (req, res) => {
  try {
    const { resume, job_description, company, role } = req.body;
    if (!resume || !job_description) {
      return res.status(400).json({ error: 'resume and job_description are required' });
    }

    const content = await callModel([
      {
        role: 'system',
        content: `You are an expert technical recruiter and career coach. Analyze how well a candidate's resume matches a job description. 
Respond in valid JSON with this exact structure:
{
  "match_score": <number 0-100>,
  "match_label": "<Weak|Fair|Good|Strong|Excellent>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "gaps": ["<gap 1>", "<gap 2>", ...],
  "recommendations": ["<action 1>", "<action 2>", ...],
  "summary": "<2-3 sentence overall assessment>"
}`
      },
      {
        role: 'user',
        content: `Company: ${company || 'Unknown'}\nRole: ${role || 'Unknown'}\n\nJOB DESCRIPTION:\n${job_description}\n\nRESUME:\n${resume}`
      }
    ], 0.3);

    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      parsed = { raw: content };
    }

    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/cover-letter — Generate tailored cover letter
router.post('/cover-letter', async (req, res) => {
  try {
    const { application_id, resume, custom_notes } = req.body;
    if (!application_id || !resume) {
      return res.status(400).json({ error: 'application_id and resume are required' });
    }

    const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(application_id);
    if (!app) return res.status(404).json({ error: 'Application not found' });

    const content = await callModel([
      {
        role: 'system',
        content: `You are a professional cover letter writer. Write compelling, concise, tailored cover letters that get interviews. 
Avoid clichés. Be specific about achievements. Keep it under 350 words. Use a professional but personable tone.`
      },
      {
        role: 'user',
        content: `Write a cover letter for this application:
Company: ${app.company}
Role: ${app.role}
${app.job_description ? `\nJob Description:\n${app.job_description}` : ''}
${custom_notes ? `\nAdditional context: ${custom_notes}` : ''}

My resume/background:
${resume}`
      }
    ]);

    res.json({ cover_letter: content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/interview-prep — Generate interview questions + guidance
router.post('/interview-prep', async (req, res) => {
  try {
    const { application_id, resume } = req.body;
    if (!application_id) {
      return res.status(400).json({ error: 'application_id is required' });
    }

    const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(application_id);
    if (!app) return res.status(404).json({ error: 'Application not found' });

    const content = await callModel([
      {
        role: 'system',
        content: `You are an expert interview coach. Generate likely interview questions and model answers for a specific role.
Respond in valid JSON with this exact structure:
{
  "behavioral": [{"question": "...", "hint": "..."}],
  "technical": [{"question": "...", "hint": "..."}],
  "company_culture": [{"question": "...", "hint": "..."}],
  "questions_to_ask": ["...", "..."]
}`
      },
      {
        role: 'user',
        content: `Prepare me for an interview at ${app.company} for the role: ${app.role}.
${app.job_description ? `\nJob Description:\n${app.job_description}` : ''}
${resume ? `\nMy background:\n${resume}` : ''}`
      }
    ], 0.5);

    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      parsed = { raw: content };
    }

    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/insights — Smart suggestions across all applications
router.post('/insights', async (req, res) => {
  try {
    const apps = db.prepare('SELECT id, company, role, status, date_applied, notes FROM applications ORDER BY date_applied DESC').all();

    if (apps.length === 0) {
      return res.json({ insights: [], summary: 'No applications yet. Start applying to get smart insights!' });
    }

    const today = new Date().toISOString().split('T')[0];

    const content = await callModel([
      {
        role: 'system',
        content: `You are a career advisor analyzing a job seeker's application pipeline. 
Provide actionable, specific insights. Today's date is ${today}.
Respond in valid JSON with this structure:
{
  "summary": "<2-3 sentence overview of their pipeline>",
  "insights": [
    {"type": "follow_up|stale|positive|warning|tip", "message": "...", "application_ids": []}
  ],
  "pipeline_health": "<Struggling|Building|Active|Strong>",
  "recommended_action": "<single most important thing they should do right now>"
}`
      },
      {
        role: 'user',
        content: `Analyze my job application pipeline:\n\n${JSON.stringify(apps, null, 2)}`
      }
    ], 0.4);

    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      parsed = { raw: content };
    }

    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
