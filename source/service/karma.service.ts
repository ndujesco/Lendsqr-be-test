import axios from 'axios';
import { AuthError } from '../middleware/error.middleware';

export class KarmaService {
  static async userIsBlacklisted(identity: string) {
    try {
      await axios.get(
        `https://adjutor.lendsqr.com/v2/verification/karma/${identity}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.KARMA_API}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return true; // status is 200 if user is found.
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return false; // status is 404 when user is not found
      } else {
        // rare case when the service is down or unreachable
        throw new AuthError(
          'Unable to access the blacklisted serivce, please try again later.'
        );
      }
    }
  }
}
