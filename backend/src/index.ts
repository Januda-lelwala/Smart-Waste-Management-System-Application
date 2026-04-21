import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import binsRouter          from './routes/bins';
import alertsRouter        from './routes/alerts';
import pickupRoutesRouter  from './routes/pickup-routes';
import analyticsRouter     from './routes/analytics';
import zonesRouter         from './routes/zones';

const app  = express();
const PORT = process.env.PORT ?? 3001;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }));
app.use(morgan('dev'));
app.use(express.json());

// Health check — Kong uses this to verify the upstream is alive
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));

// Versioned API
app.use('/v1/bins',           binsRouter);
app.use('/v1/alerts',         alertsRouter);
app.use('/v1/pickup-routes',  pickupRoutesRouter);
app.use('/v1/analytics',      analyticsRouter);
app.use('/v1/zones',          zonesRouter);

app.listen(PORT, () => {
  console.log(`Garabadge backend running on http://localhost:${PORT}`);
});

export default app;