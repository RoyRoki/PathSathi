"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithCustomToken, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { Mail, ShieldCheck, Sparkles, Loader2 } from "lucide-react";

export function AgencyAuth({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const [loadingAction, setLoadingAction] = useState<"otp" | "verify" | "google" | null>(null);
  const loading = loadingAction !== null;
  const [sent, setSent] = useState(false);

  const sendOtp = async () => {
    setLoadingAction("otp");
    setStatus(null);
    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }
      setSent(true);
      setStatus("OTP sent. Check your inbox.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to send OTP");
    } finally {
      setLoadingAction(null);
    }
  };

  const verifyOtp = async () => {
    setLoadingAction("verify");
    setStatus(null);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "OTP verification failed");
      }
      const auth = getFirebaseAuth();
      if (!auth) {
        throw new Error("Firebase is not configured.");
      }
      await signInWithCustomToken(auth, data.customToken);
      router.push("/dashboard");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "OTP verification failed");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleGoogleLogin = async () => {
    setLoadingAction("google");
    setStatus(null);
    try {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error("Firebase is not configured.");

      const provider = new GoogleAuthProvider();
      // Use the provided Web Client ID if needed, but usually Firebase handles this automatically
      // providing the project is configured correctly in the console.
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Google login error:", error);
      setStatus("Failed to sign in with Google. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-foreground/80 lowercase tracking-wider uppercase ml-1">Business Email</span>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="block w-full pl-11 pr-4 py-4 rounded-2xl border border-border bg-white placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              placeholder="agency@pathsathi.com"
              type="email"
            />
          </div>
        </label>

        {sent && (
          <label className="block space-y-2 animate-fade-in-up-premium">
            <span className="text-sm font-semibold text-foreground/80 lowercase tracking-wider uppercase ml-1">Verification Code</span>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <ShieldCheck className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <input
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                className="block w-full pl-11 pr-4 py-4 rounded-2xl border border-border bg-white placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm tracking-[0.4em] font-mono text-xl"
                placeholder="000000"
                maxLength={6}
              />
            </div>
          </label>
        )}
      </div>

      {status && (
        <div className={`p-4 rounded-2xl text-sm font-medium ${status.toLowerCase().includes("sent")
          ? "bg-primary/5 text-primary border border-primary/10"
          : "bg-destructive/5 text-destructive border border-destructive/10"
          }`}>
          {status}
        </div>
      )}

      <div className="flex flex-col gap-3 pt-2">
        {!sent ? (
          <Button
            size="lg"
            className="w-full h-14 rounded-2xl text-base font-bold bg-primary hover:bg-primary/90 shadow-lg group"
            onClick={sendOtp}
            disabled={loading || !email}
          >
            {loadingAction === "otp" ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
            Get Verification Code
          </Button>
        ) : (
          <Button
            size="lg"
            className="w-full h-14 rounded-2xl text-base font-bold bg-primary hover:bg-primary/90 shadow-lg"
            onClick={verifyOtp}
            disabled={loading || !sent || otp.length < 6}
          >
            {loadingAction === "verify" ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Verify & Sign In"}
          </Button>
        )}

        {sent && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-primary font-medium"
            onClick={sendOtp}
            disabled={loading}
          >
            Didn't receive code? Resend
          </Button>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 my-2">
          <div className="h-px bg-border/60 flex-1" />
          <span className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.2em] font-bold">Or</span>
          <div className="h-px bg-border/60 flex-1" />
        </div>

        {/* Google Login Button */}
        <Button
          variant="outline"
          className="w-full h-14 rounded-2xl text-base font-bold border-2 border-primary/10 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all flex items-center justify-center gap-3 bg-white/50"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {loadingAction === "google" ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                fill="#FBBC05"
              />
              <path
                d="M12 4.61c1.61 0 3.09.56 4.23 1.64l3.18-3.18C17.45 1.19 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          Continue with Google
        </Button>
      </div>
    </div>
  );
}
