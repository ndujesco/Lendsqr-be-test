import jwt from 'jsonwebtoken';

import { createJWT } from './auth.util';
import { UserI } from './interface.util';

const user_id = Math.floor(Math.random() * 1000);

process.env = {
  JWT_SECRET: '<jwt_secret>',
  JWT_EXPIRATION_TIME: '2m',
};

describe('createJWT', () => {
  it('should return the payload after decoding the token', () => {
    const payload = { user_id, email: '<email>' } as UserI;
    const token = createJWT(payload);
    const decode = jwt.verify(token, process.env.JWT_SECRET as string);
    expect(decode).toMatchObject(payload);
  });
});
