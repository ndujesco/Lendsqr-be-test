import { Router } from 'express';
import RequestValidator from '../middleware/validation';

import { TransactionController } from '../controller/transaction';
import {
  InitiateTransactionDto,
  TransferDto,
  VerifyTransactionDto,
} from '../dto/transaction';
import { protect } from '../middleware/auth';

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
  '/topUp',
  protect,
  RequestValidator.validate(InitiateTransactionDto, 'body'),
  TransactionController.topUp
);

transactionRouter.post(
  '/verify',
  protect,
  RequestValidator.validate(VerifyTransactionDto, 'body'),
  TransactionController.verify
);

export default transactionRouter;
