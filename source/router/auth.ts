import { Router } from 'express';
import RequestValidator from '../middleware/validation';
import { SignUpDto } from '../dto/auth';
import AuthController from '../controller/auth';

const authRouter = Router();

authRouter.post(
  '/signUp',
  RequestValidator.validate(SignUpDto, 'body'),
  AuthController.signUp
);

export default authRouter;
