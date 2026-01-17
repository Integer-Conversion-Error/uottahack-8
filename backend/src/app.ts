import express from 'express';
import cors from 'cors';
import path from 'path';
import apiRoutes from './routes/api.routes';

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api', apiRoutes);
app.use('/audio', express.static(path.join(__dirname, '../public/audio')));
app.use('/images', express.static(path.join(__dirname, '../public/images')));

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});

export default app;
