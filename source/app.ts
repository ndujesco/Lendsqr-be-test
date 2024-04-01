import express from 'express';
import { Application } from 'express';
import authRouter from './router/auth';
import { ErrorHandler } from './middleware/error.middleware';
import transactionRouter from './router/transaction';
import userRouter from './router/user';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => res.json({ message: 'Welcome!' }));
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/transaction', transactionRouter);
app.use('/api/v1/user', userRouter);


app.use('*', ErrorHandler.pagenotFound());
app.use(ErrorHandler.handle());
ErrorHandler.exceptionRejectionHandler();

export default app;
