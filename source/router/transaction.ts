import { Router } from 'express';
import RequestValidator from '../middleware/validation';

import { TransactionController } from '../controller/transaction';
import { TransferDto } from '../dto/transaction';
import { protect } from '../middleware/auth';

const transactionRouter = Router();

transactionRouter.post(
  '/transfer',
  protect,
  RequestValidator.validate(TransferDto, 'body'),
  TransactionController.transfer
);

export default transactionRouter;
