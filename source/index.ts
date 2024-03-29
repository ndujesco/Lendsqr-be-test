import app from './app';
import * as dotenv from 'dotenv';
import { Application } from 'express';
import logger from './utils/winston';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });


class Server {
  private port = process.env.PORT || 3000;
  private app;

  constructor(app: Application) {
    this.app = app;
  }

  start() {
    this.app.listen(this.port, () => {
      logger.info(`Server listening on port ${this.port}`);
    });
  }
}

const server = new Server(app);
server.start();
