import { Router } from 'express';

import { TransactionController } from '../controller/transaction.controller';

import RequestValidator from '../middleware/validation.middleware.';
import { protect } from '../middleware/auth.middleware';

import {
  InitiateTransactionDto,
  TransferDto,
  VerifyTransactionDto,
} from '../dto/transaction.dto';

const transactionRouter = Router();

transactionRouter.post(
  '/transfer',
  protect,
  RequestValidator.validate(TransferDto, 'body'),
  TransactionController.transfer
);

transactionRouter.post(
  '/withdraw',
  protect,
  RequestValidator.validate(InitiateTransactionDto, 'body'),
  TransactionController.withdraw
);

transactionRouter.post(
  '/topup',
  protect,
  RequestValidator.validate(InitiateTransactionDto, 'body'),
  TransactionController.topup
);

transactionRouter.post(
  '/verify',
  protect,
  RequestValidator.validate(VerifyTransactionDto, 'body'),
  TransactionController.verify
);

export default transactionRouter;
