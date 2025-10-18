import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mail, ArrowRight, CheckCircle2, ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function EmailVerify() {
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const prefilledEmail = query.get("email") || "";

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState(prefilledEmail);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setStep("otp");
  };

  const handleOtpChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    const nextInput = document.getElementById(`otp-${index + 1}`);
    if (value && nextInput) nextInput.focus();
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Verifying OTP: ${otp.join("")} for ${email}`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* ✅ Back to Home — fixed top-left */}
      <button
        onClick={() =>  navigate(`/auth?auth=${encodeURIComponent("signup")}`)}
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to signup
      </button>

      {/* Floating blurred elements like the landing page */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-40 right-20 w-32 h-32 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-card backdrop-blur-xl p-8 z-10 animate-fade-in-up">
        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-md">
            <Mail className="w-6 h-6 text-white" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold">
              {step === "email" ? "Verify your email" : "Enter your OTP"}
            </h1>
            <p className="text-muted-foreground text-sm max-w-sm">
              {step === "email"
                ? "We'll send you a 6-digit verification code to confirm your email address."
                : `We've sent a 6-digit code to ${email}. Enter it below to continue.`}
            </p>
          </div>

          {step === "email" ? (
            <form
              onSubmit={handleEmailSubmit}
              className="w-full space-y-4 animate-fade-in-up"
            >
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-lg bg-background border-border focus:ring-2 focus:ring-primary/30"
              />
              <Button
                type="submit"
                size="lg"
                className="w-full font-semibold group"
              >
                Send Verification Code
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          ) : (
            <form
              onSubmit={handleVerify}
              className="w-full space-y-6 animate-fade-in-up"
            >
              <div className="flex justify-center gap-3">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    className="w-12 h-12 text-center text-lg font-semibold bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                ))}
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full font-semibold group"
              >
                Verify Code
                <CheckCircle2 className="ml-2 w-4 h-4 group-hover:scale-110 transition-transform" />
              </Button>
            </form>
          )}

          {step === "otp" && (
            <button
              onClick={() => setStep("email")}
              className="text-sm text-muted-foreground hover:text-foreground underline mt-2"
            >
              Change email
            </button>
          )}
        </div>

        {/* Footer-like badge */}
        <div className="mt-10 flex justify-center">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
            🔒 Secure verification powered by MailFlow
          </Badge>
        </div>
      </div>
    </div>
  );
}
