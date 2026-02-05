import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import { hashOtp } from "@/lib/otp";
import { FieldValue } from "firebase-admin/firestore";

const MAX_ATTEMPTS = 5;

export async function POST(req: Request) {
  try {
    const { email, otp } = (await req.json()) as {
      email?: string;
      otp?: string;
    };

    if (!email || !otp) {
      return NextResponse.json({ error: "Missing credentials." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const adminDb = getAdminDb();
    const adminAuth = getAdminAuth();
    const otpDocRef = adminDb.collection("otpRequests").doc(normalizedEmail);
    const otpSnapshot = await otpDocRef.get();

    if (!otpSnapshot.exists) {
      return NextResponse.json({ error: "OTP expired or not found." }, { status: 400 });
    }

    const data = otpSnapshot.data();
    const attempts = data?.attempts ?? 0;

    if (attempts >= MAX_ATTEMPTS) {
      return NextResponse.json({ error: "Too many attempts." }, { status: 429 });
    }

    const expiresAt = data?.expires_at?.toDate?.();
    if (expiresAt && expiresAt.getTime() < Date.now()) {
      await otpDocRef.delete();
      return NextResponse.json({ error: "OTP expired." }, { status: 400 });
    }

    const expectedHash = data?.otp_hash;
    const receivedHash = hashOtp(normalizedEmail, otp.trim());

    if (expectedHash !== receivedHash) {
      await otpDocRef.update({
        attempts: FieldValue.increment(1)
      });
      return NextResponse.json({ error: "Invalid OTP." }, { status: 400 });
    }

    await otpDocRef.delete();

    let userRecord;
    let isNew = false;
    try {
      userRecord = await adminAuth.getUserByEmail(normalizedEmail);
    } catch (error) {
      userRecord = await adminAuth.createUser({
        email: normalizedEmail,
        emailVerified: true
      });
      isNew = true;
    }

    const agencyRef = adminDb.collection("agencies").doc(userRecord.uid);
    const agencySnapshot = await agencyRef.get();
    if (!agencySnapshot.exists) {
      await agencyRef.set(
        {
          uid: userRecord.uid,
          email: normalizedEmail,
          is_verified: false,
          status: "pending_verification",
          trial_start: null,
          trial_expiry: null,
          created_at: FieldValue.serverTimestamp()
        },
        { merge: true }
      );
    }

    const customToken = await adminAuth.createCustomToken(userRecord.uid, {
      role: "agency"
    });

    return NextResponse.json({ ok: true, customToken, uid: userRecord.uid, isNew });
  } catch (error) {
    return NextResponse.json(
      { error: "OTP verification failed." },
      { status: 500 }
    );
  }
}
