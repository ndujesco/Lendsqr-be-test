import express from 'express';
import { Application } from 'express';
import authRouter from './router/auth';
import { ErrorHandler } from './middleware/error';
import transactionRouter from './router/transaction';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => res.json({ message: 'Welcome!' }));
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/transaction', transactionRouter);

app.use('*', ErrorHandler.pagenotFound());
app.use(ErrorHandler.handle());
ErrorHandler.exceptionRejectionHandler();

export default app;
