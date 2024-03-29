import app from './app';
import { Application } from 'express';

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
