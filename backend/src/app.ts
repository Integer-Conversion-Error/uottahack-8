import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});

export default app;
