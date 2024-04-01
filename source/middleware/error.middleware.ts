import { Request, Response, NextFunction } from 'express';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public rawErrors?: string[]
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ErrorHandler {
  static handle() {
    return (err: ApiError, req: Request, res: Response, next: NextFunction) => {
      const statusCode = err.statusCode || 500;
      let errorStack = {};
      if (process.env.NODE_ENV == 'development') {
        errorStack = { stack: err.stack };
      }
      res.status(statusCode).json({
        message: err.message,
        success: false,
        errorStack,
        errors: err.rawErrors ?? [],
      });
    };
  }

  static pagenotFound() {
    return (req: Request, res: Response, next: NextFunction) => {
      throw new NotFoundError(`Requested Path ${req.path} is not found`);
    };
  }

  static exceptionRejectionHandler() {
    process.on('unhandledRejection', (reason: Error, promise: Promise<any>) => {
      console.log(reason.name, reason.message);
      console.log('UNHANDLED REJECTION!.. Shutting down Server');
      throw reason;
    });

    process.on('uncaughtException', (err: Error) => {
      console.log(err.name, err.message);
      console.log('UNCAUGHT EXCEPTION!');
      process.exit(1);
    });
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class AuthError extends ApiError {
  constructor(message: string) {
    super(message, 401);
  }
}

export class BadRequestError extends ApiError {
  constructor(public message: string, public errors?: string[]) {
    super(message, 400, errors);
  }
}
