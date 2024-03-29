export class Helper {
  static generateWalletAccountNumber(): string {
    let accountNumber = '88';
    for (let i = 0; i < 8; i++) {
      accountNumber += Math.floor(Math.random() * 10);
    }
    return accountNumber;
  }
}
