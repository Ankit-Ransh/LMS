import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// Signup
router.post('/signup', async (req, res) => {
    const { name, email, password, isAdmin } = req.body; // use isAdmin instead of role
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    try {
        const existing = await pool.query('SELECT id FROM "User" WHERE email = $1', [email]);
        if (existing.rows.length > 0) return res.status(409).json({ error: 'Email already in use' });
        const hash = await bcrypt.hash(password, 10);
        let apiKey = null;
        if (isAdmin) {
            apiKey = crypto.randomBytes(32).toString('hex');
        }
        const userResult = await pool.query(
            'INSERT INTO "User" (name, email, password, "createdAt", "apiKey") VALUES ($1, $2, $3, NOW(), $4) RETURNING id, name, email, "apiKey"',
            [name, email, hash, apiKey as string | null]
        );
        const user = userResult.rows[0];
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ error: 'Signup failed' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }
    try {
        const userResult = await pool.query('SELECT id, name, email, password FROM "User" WHERE email = $1', [email]);
        if (userResult.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        const user = userResult.rows[0];
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: 'Login failed' });
    }
});

export default router; 