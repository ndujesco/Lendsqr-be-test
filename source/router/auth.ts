import { Router } from 'express';
import RequestValidator from '../middleware/validation';
import { SignInDto, SignUpDto, UpdateEmailDto, VerifyEmailDto } from '../dto/auth';
import AuthController from '../controller/auth';

import 'express-async-errors';

const authRouter = Router();

authRouter.post(
  '/signUp',
  RequestValidator.validate(SignUpDto, 'body'),
  AuthController.signUp
);

authRouter.post(
  '/signIn',
  RequestValidator.validate(SignInDto, 'body'),
  AuthController.signIn
);

authRouter.patch(
  '/verification/email',
  RequestValidator.validate(VerifyEmailDto, 'query'),
  AuthController.verifyEmail
);

authRouter.put(
  '/update/email',
  RequestValidator.validate(UpdateEmailDto, 'body'),
  AuthController.updateEmail
);

export default authRouter;
