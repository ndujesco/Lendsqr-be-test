import { Transporter, createTransport } from 'nodemailer';

import { Helper } from '../util/helper.util';
import logger from '../util/winston.util';

export class EmailService {
  private static transporter: Transporter = createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  static async sendOtp(input: { to: string; otp: string; name: string }) {
    const { to, otp, name } = input;
    logger.info(`Sending OTP to ${to}`);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: 'ONE TIME PASSWORD',
      html: Helper.genEmailMessage({ name, otp }),
    };

    await this.transporter.sendMail(mailOptions);
  }
}
