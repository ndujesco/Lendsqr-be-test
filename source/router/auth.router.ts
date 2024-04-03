import { Router } from 'express';
import 'express-async-errors';

import { AuthController } from '../controller/auth.controller';

import RequestValidator from '../middleware/validation.middleware.';

import { protect } from '../middleware/auth.middleware';

import {
  SignInDto,
  SignUpDto,
  UpdateEmailDto,
  VerifyEmailDto,
  VerifyPasswordDto,
} from '../dto/auth.dto';

const authRouter = Router();

authRouter.post(
  '/signUp',
  RequestValidator.validate(SignUpDto, 'body'),
  AuthController.signUp
);

authRouter.patch(
  '/verification/email',
  RequestValidator.validate(VerifyEmailDto, 'query'),
  AuthController.verifyEmail
);

authRouter.post(
  '/signIn',
  RequestValidator.validate(SignInDto, 'body'),
  AuthController.signIn
);

authRouter.put(
  '/update/email',
  RequestValidator.validate(UpdateEmailDto, 'body'),
  AuthController.updateEmail
);

/**
 * Verify password for a signed in user.
 * Important for sensitive transactions.
 */
authRouter.post(
  '/password',
  protect,
  RequestValidator.validate(VerifyPasswordDto, 'body'),
  AuthController.verifyPassword
);

export default authRouter;
