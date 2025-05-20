import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authModule } from './modules/auth/auth.module';
import { usersModule } from './modules/users/users.module';
import { pingRouter } from './routes/ping.routes';
import leadsRouter from './routes/leads';
import teamsRouter from './routes/teams';
import checkinsRouter from './routes/checkins';
import notificationsRouter from './routes/notifications';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authModule.router);
app.use('/ping', pingRouter);
app.use('/api/users', usersModule.router);
app.use('/api', leadsRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/checkins', checkinsRouter);
app.use('/api/notifications', notificationsRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 