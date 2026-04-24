import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { collectDefaultMetrics, register } from 'prom-client';

import authRoutes from './modules/auth/auth.routes';
import accountRoutes from './modules/account/account.routes';
import transactionRoutes from './modules/transaction/transaction.routes';

collectDefaultMetrics({ prefix: 'securebank_' });

const app = express();

// Railway menggunakan reverse proxy — wajib agar rate-limiter & req.ip benar
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'SecureBank API', timestamp: new Date().toISOString() });
});

app.get('/metrics', async (_req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/accounts', accountRoutes);
app.use('/api/v1/transactions', transactionRoutes);

app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[Error]', err.stack);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ SecureBank API berjalan di http://localhost:${PORT}`);
    console.log(`📊 Metrics: http://localhost:${PORT}/metrics`);
});

export default app;