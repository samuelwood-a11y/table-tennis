"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { BackgroundBlobs } from "@/components/layout/BackgroundBlobs";
import Link from "next/link";

export default function ForgotCodePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/groups/recover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
    const data = await res.json();
    if (res.ok) {
      setSent(true);
    } else {
      setError(data.error ?? "Something went wrong");
    }
    setLoading(false);
  }

  return (
    <>
      <BackgroundBlobs />
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-5">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🔑</div>
            <h1 className="text-2xl font-bold text-white">Forgot Group Code?</h1>
            <p className="text-white/40 text-sm mt-1.5">
              We'll email you the group code linked to your address.
            </p>
          </div>

          {sent ? (
            <GlassCard className="text-center">
              <div className="text-4xl mb-3">📬</div>
              <h2 className="text-lg font-semibold text-white mb-2">Email Sent</h2>
              <p className="text-white/50 text-sm">
                If we have a group linked to <span className="text-white">{email}</span>, you'll receive the code shortly.
              </p>
              <Link href="/" className="block mt-5">
                <GlassButton variant="ghost" className="w-full">Back to Home</GlassButton>
              </Link>
            </GlassCard>
          ) : (
            <GlassCard>
              <form onSubmit={handleSubmit} className="space-y-4">
                <GlassInput
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={error}
                  required
                />
                <GlassButton type="submit" loading={loading} className="w-full" size="lg">
                  Send Group Code
                </GlassButton>
              </form>
            </GlassCard>
          )}

          <div className="text-center">
            <Link href="/" className="text-sm text-white/40 hover:text-white/70 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
