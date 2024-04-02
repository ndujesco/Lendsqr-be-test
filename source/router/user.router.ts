import { Router } from 'express';

import { UserController } from '../controller/user.controller';

import { protect } from '../middleware/auth.middleware';
import RequestValidator from '../middleware/validation.middleware.';

import {
  GetByUserIdDto,
  GetByWalletNumberDto,
  GetUserByDto,
  UserTransactionsDto,
} from '../dto/user.dto';

const userRouter = Router();

userRouter.get('/my/profile', protect, UserController.getMyProfile);

userRouter.get('/wallet', protect, UserController.getMyBalance);

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
  RequestValidator.validate(GetByUserIdDto, 'query'),
  UserController.getCommonTransactions
);

userRouter.get(
  '/profile/wallet',
  protect,
  RequestValidator.validate(GetByWalletNumberDto, 'query'),
  UserController.getUserFromWalletNumber
);

userRouter.get(
  '/profile/id',
  protect,
  RequestValidator.validate(GetByUserIdDto, 'query'),
  UserController.getUserFromId
);

userRouter.get(
  '/profile/by',
  protect,
  RequestValidator.validate(GetUserByDto, 'query'),
  UserController.getUserBy
);

export default userRouter;
