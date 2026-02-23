import { resend } from "../lib/resend";
import { generateHexadecimalCode } from "../utils/codes";
import { prisma } from "../utils/db";

export const EmailService = {
  async sendVerificationCode(userId: number, email: string) {
    const otpCode = generateHexadecimalCode(4);

    await prisma.user.update({
      where: { id: userId },
      data: {
        otp_code: otpCode,
        otp_create_at: new Date(),
      },
    });

    return await resend.emails.send({
      from: "Tock Music <onboardin@resend.dev>",
      to: email,
      subject: `Tu codigo de verificación es ${otpCode}`,
      html: `tu código es: ${otpCode}`,
    });
  },
};
