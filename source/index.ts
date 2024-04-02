import * as dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

import { Application } from 'express';

import app from './app';

import logger from './util/winston.util';

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
