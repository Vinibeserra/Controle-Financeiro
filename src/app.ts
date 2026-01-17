import express from 'express';
import authRoutes from './modules/auth/auth.routes';
import { transactionRouter } from './modules/transactions/transactions.routes';

const app = express();

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/transactions', transactionRouter);


export { app };