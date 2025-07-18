import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { authenticate, AuthRequest } from '../middleware/auth';

dotenv.config();
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const router = express.Router();

// List user's enrollments
router.get('/enrollments', authenticate, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const result = await pool.query('SELECT e.*, c.title, c.description FROM "Enrollment" e JOIN "Course" c ON e."courseId" = c.id WHERE e."userId" = $1', [userId]);
  res.json(result.rows);
});

// Get user's progress
router.get('/progress', authenticate, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const result = await pool.query('SELECT p.*, c.title as course_title, l.title as lesson_title FROM "Progress" p JOIN "Course" c ON p."courseId" = c.id JOIN "Lesson" l ON p."lessonId" = l.id WHERE p."userId" = $1', [userId]);
  res.json(result.rows);
});

// Update progress
router.post('/progress', authenticate, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { courseId, lessonId, status } = req.body;
  if (!courseId || !lessonId || !status) {
    return res.status(400).json({ error: 'courseId, lessonId, and status are required' });
  }
  // Upsert logic
  const upsert = await pool.query(
    'INSERT INTO "Progress" ("userId", "courseId", "lessonId", status, "updatedAt") VALUES ($1, $2, $3, $4, NOW()) ON CONFLICT ("userId", "courseId", "lessonId") DO UPDATE SET status = $4, "updatedAt" = NOW() RETURNING *',
    [userId, courseId, lessonId, status]
  );
  res.json(upsert.rows[0]);
});

export default router; 