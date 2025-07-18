import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import coursesRoutes from './routes/courses';
import userRoutes from './routes/user';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/courses', coursesRoutes);
app.use('/me', userRoutes);

app.get('/', (req, res) => {
  res.send('LMS Backend is running');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 