import { Router } from 'express';
import RequestValidator from '../middleware/validation';
import {
  SignInDto,
  SignUpDto,
  UpdateEmailDto,
  VerifyEmailDto,
  VerifyPasswordDto,
} from '../dto/auth';
import { AuthController } from '../controller/auth';

import 'express-async-errors';
import { protect } from '../middleware/auth';

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
