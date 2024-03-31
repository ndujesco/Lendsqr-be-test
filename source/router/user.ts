import { Router } from 'express';

import { protect } from '../middleware/auth';
import { UserController } from '../controller/user';
import RequestValidator from '../middleware/validation';
import { UserTransactionsDto } from '../dto/user';

const userRouter = Router();

userRouter.get('/profile', protect, UserController.getMyProfile);

userRouter.get('/wallet', protect, UserController.getMyBalance);

userRouter.get(
  '/transaction/type',
  protect,
  RequestValidator.validate(UserTransactionsDto, 'query'),
  UserController.getTransactionsByType
);

userRouter.get(
  '/transaction/all',
  protect,
  UserController.getTransactions
);

export default userRouter;
