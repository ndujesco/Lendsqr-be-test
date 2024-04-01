export class PaymentService {
  private static DUMMY_CHECKOUT_LINK = 'https://dummycheckoutlink';

  static async initializeWithdrawal(input: {
    amount: number;
    transactionId: number;
  }): Promise<string> {
    /**
     * The service generates the checkout link accordingly.
     * Now, after completing the payment, the transaction id generated by the service is got.
     * This id is needed to verify the transaction
     */

    return this.DUMMY_CHECKOUT_LINK;
  }

  static async initializeTopUp(input: {
    amount: number;
    transactionId: number;
  }): Promise<string> {
    /**
     * The service generates the checkout link accordingly.
     * Now, after completing the payment, the transaction id generated by the service is got.
     * This id is needed to verify the transaction
     */

    return this.DUMMY_CHECKOUT_LINK;
  }

  static async verifyTransaction(serviceTransactionId: number) {
    /**
     * The API to verify if the transaction was successful.
     */

    const transactionId = serviceTransactionId;
    const success = Math.random() * 100 < 95; // 95% success rate

    return {
      transactionId,
      success,
    };
  }
}
