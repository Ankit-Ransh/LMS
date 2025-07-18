import 'dotenv/config';
import express from 'express';
import { Pool } from 'pg';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const router = express.Router();

// List all courses
router.get('/', async (req, res) => {
    const result = await pool.query('SELECT * FROM "Course"');
    res.json(result.rows);
});

// Get course details with lessons
router.get('/:id', async (req, res) => {
    const id = Number(req.params.id);
    const courseResult = await pool.query('SELECT * FROM "Course" WHERE id = $1', [id]);
    if (courseResult.rows.length === 0) return res.status(404).json({ error: 'Course not found' });
    const lessonsResult = await pool.query('SELECT * FROM "Lesson" WHERE "courseId" = $1 ORDER BY "order" ASC', [id]);
    const course = courseResult.rows[0];
    course.lessons = lessonsResult.rows;
    res.json(course);
});

// Enroll in a course
router.post('/:id/enroll', authenticate, async (req: AuthRequest, res) => {
    const courseId = Number(req.params.id);
    const userId = req.userId!;
    // Check if already enrolled
    const existing = await pool.query('SELECT id FROM "Enrollment" WHERE "userId" = $1 AND "courseId" = $2', [userId, courseId]);
    if (existing.rows.length > 0) return res.status(409).json({ error: 'Already enrolled' });
    const enrollment = await pool.query('INSERT INTO "Enrollment" ("userId", "courseId", "enrolledAt") VALUES ($1, $2, NOW()) RETURNING *', [userId, courseId]);
    res.json(enrollment.rows[0]);
});

// Admin: Create a new course
router.post('/', authenticate, requireAdmin, async (req, res) => {
    const { title, description, instructor, price } = req.body;
    if (!title || !description || !instructor || !price) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    const result = await pool.query(
        'INSERT INTO "Course" (title, description, instructor, price) VALUES ($1, $2, $3, $4) RETURNING *',
        [title, description, instructor, price]
    );
    res.status(201).json(result.rows[0]);
});

export default router; 