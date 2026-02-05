import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { generateOtp, hashOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/brevo";
import { FieldValue } from "firebase-admin/firestore";

const COOLDOWN_MS = 60 * 1000;
const EXPIRY_MS = 10 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email?: string };
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const adminDb = getAdminDb();
    const otpDocRef = adminDb.collection("otpRequests").doc(normalizedEmail);
    const otpSnapshot = await otpDocRef.get();

    if (otpSnapshot.exists) {
      const data = otpSnapshot.data();
      const lastSentAt = data?.last_sent_at?.toDate?.()?.getTime?.() ?? 0;
      if (Date.now() - lastSentAt < COOLDOWN_MS) {
        return NextResponse.json({
          ok: true,
          message: "OTP already sent. Please wait before requesting again."
        });
      }
    }

    const otp = generateOtp();
    const otpHash = hashOtp(normalizedEmail, otp);
    const expiresAt = new Date(Date.now() + EXPIRY_MS);

    await otpDocRef.set(
      {
        email: normalizedEmail,
        otp_hash: otpHash,
        expires_at: expiresAt,
        attempts: 0,
        created_at: FieldValue.serverTimestamp(),
        last_sent_at: FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    await sendOtpEmail({ to: normalizedEmail, otp });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send OTP." },
      { status: 500 }
    );
  }
}







