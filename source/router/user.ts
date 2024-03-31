import { Router } from 'express';

import { protect } from '../middleware/auth';
import { UserController } from '../controller/user';
import RequestValidator from '../middleware/validation';
import { GetUserByDto, UserTransactionsDto } from '../dto/user';

const userRouter = Router();

userRouter.get('/my/profile', protect, UserController.getMyProfile);

userRouter.get('/wallet', protect, UserController.getMyBalance);

userRouter.get(
  '/profile/wallet',
  protect,
  UserController.getUserFromWalletNumber
);

userRouter.get('/profile/id', protect, UserController.getUserFromId);

userRouter.get(
  '/profile/by',
  protect,
  RequestValidator.validate(GetUserByDto, 'query'),
  UserController.getUserBy
);

// user

userRouter.get(
  '/transaction/type',
  protect,
  RequestValidator.validate(UserTransactionsDto, 'query'),
  UserController.getTransactionsByType
);

userRouter.get('/transaction/all', protect, UserController.getTransactions);

userRouter.get(
  '/transaction/common',
  protect,
  UserController.getCommonTransactions
);

export default userRouter;
