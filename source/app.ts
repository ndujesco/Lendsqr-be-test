import express from 'express';
import { Application } from 'express';

const app: Application = express();

app.get('/', (req, res) => res.json({ message: 'Welcome!' }));

export default app;
