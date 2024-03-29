import app from './app';
import * as dotenv from 'dotenv';
import { Application } from 'express';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
console.log(process.env.PENNY);

class Server {
  private port = process.env.PORT || 3000;
  private app;

  constructor(app: Application) {
    this.app = app;
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`Server listening on port ${this.port}`);
    });
  }
}

const server = new Server(app);
server.start();
