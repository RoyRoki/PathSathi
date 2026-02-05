import "server-only";
import crypto from "crypto";

export function generateOtp() {
  return String(crypto.randomInt(100000, 999999));
}

export function hashOtp(email: string, otp: string) {
  const otpSecret = process.env.OTP_SECRET;
  if (!otpSecret) {
    throw new Error("Missing OTP_SECRET.");
  }
  return crypto
    .createHash("sha256")
    .update(`${email.toLowerCase()}::${otp}::${otpSecret}`)
    .digest("hex");
}
