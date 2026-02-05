"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithCustomToken } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { Mail, ShieldCheck, Sparkles, Loader2 } from "lucide-react";

export function AgencyAuth({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const sendOtp = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
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
      setLoading(false);
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
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
            Get Verification Code
          </Button>
        ) : (
          <Button
            size="lg"
            className="w-full h-14 rounded-2xl text-base font-bold bg-primary hover:bg-primary/90 shadow-lg"
            onClick={verifyOtp}
            disabled={loading || !sent || otp.length < 6}
          >
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Verify & Sign In"}
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
      </div>
    </div>
  );
}
