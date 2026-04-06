import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    // 1. Create the transporter (SMTP configuration)
    console.log("Verification email details:", { email, username, verifyCode });
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, 
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT === "465", // true for 465, false for others
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 2. Render the React component to an HTML string
    const emailHtml = await render(VerificationEmail({ username, otp: verifyCode }));

    // 3. Send the mail
    const mailOptions = {
      from: '"Mystery Message" <${process.env.MAILTRAP_SENDERMAIL}>',
      to: email,
      subject: "Verification Code",
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);

    return { success: true, message: "Verification email sent successfully" };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { success: false, message: "Failed to send verification email" };
  }
}