import { AuthController } from './auth.controller';

jest.mock('../repository/user.repository.ts');
jest.mock('../repository/wallet.repository.ts');

describe('AuthController', () => {
  it('should be defined.', () => {
    expect(AuthController).toBeDefined();
  });

  describe('signUp', () => {
    // it('');
  });
});
