import { Router } from 'express';
import RequestValidator from '../middleware/validation.middleware.';

import { TransactionController } from '../controller/transaction.contoller';
import {
  InitiateTransactionDto,
  TransferDto,
  VerifyTransactionDto,
} from '../dto/transaction.dto';
import { protect } from '../middleware/auth.middleware';

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
