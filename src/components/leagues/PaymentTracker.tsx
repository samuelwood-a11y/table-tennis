"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { updatePlayerPayment } from "@/actions/leagues";
import { useRouter } from "next/navigation";
import type { PlayerPayment, Player } from "@prisma/client";

type PaymentWithPlayer = PlayerPayment & { player: Player & { emoji?: string | null } };

interface PaymentTrackerProps {
  payments: PaymentWithPlayer[];
  currency: string;
  expectedPot?: number | null;
  prizeRows: { position: number; label: string; amount?: number | null }[];
}

export function PaymentTracker({ payments, currency, expectedPot, prizeRows }: PaymentTrackerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const sym = currency === "GBP" ? "£" : currency === "USD" ? "$" : currency === "EUR" ? "€" : currency;
  const collected = payments.reduce((s, p) => s + p.amountPaid, 0);
  const paidCount = payments.filter((p) => p.status === "PAID").length;
  const prizeTotal = prizeRows.reduce((s, r) => s + (r.amount ?? 0), 0);

  async function togglePayment(payment: PaymentWithPlayer) {
    setLoading(payment.id);
    const newStatus = payment.status === "PAID" ? "UNPAID" : "PAID";
    await updatePlayerPayment(payment.id, {
      status: newStatus,
      amountPaid: newStatus === "PAID" ? payment.amountDue : 0,
      paidAt: newStatus === "PAID" ? new Date() : null,
    });
    router.refresh();
    setLoading(null);
  }

  return (
    <div className="space-y-4">
      {/* Pot summary */}
      {expectedPot && expectedPot > 0 && (
        <GlassCard>
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-3">Prize Pot</h3>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center">
              <p className="text-xl font-bold text-violet-300">{sym}{expectedPot.toFixed(0)}</p>
              <p className="text-xs text-white/40">Expected</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-emerald-400">{sym}{collected.toFixed(0)}</p>
              <p className="text-xs text-white/40">Collected</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-amber-400">{sym}{(expectedPot - collected).toFixed(0)}</p>
              <p className="text-xs text-white/40">Outstanding</p>
            </div>
          </div>
          {prizeRows.length > 0 && (
            <div className="border-t border-white/10 pt-3 space-y-1.5">
              {prizeRows.map((r) => (
                <div key={r.position} className="flex justify-between text-sm">
                  <span className="text-white/50">{r.label}</span>
                  <span className="text-white font-semibold">{sym}{(r.amount ?? 0).toFixed(0)}</span>
                </div>
              ))}
              {Math.abs(prizeTotal - expectedPot) > 0.01 && (
                <p className="text-xs text-amber-400 mt-2">
                  ⚠️ Payout ({sym}{prizeTotal.toFixed(0)}) doesn't match expected pot ({sym}{expectedPot.toFixed(0)})
                </p>
              )}
            </div>
          )}
        </GlassCard>
      )}

      {/* Payment list */}
      {payments.length > 0 && (
        <GlassCard padding="none" className="overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Payments</h3>
            <span className="text-xs text-white/40">{paidCount}/{payments.length} paid</span>
          </div>
          {payments.map((payment) => (
            <div key={payment.id} className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0">
              <PlayerAvatar name={payment.player.name} avatarColor={payment.player.avatarColor} emoji={payment.player.emoji} size="xs" />
              <span className="text-sm text-white flex-1">{payment.player.name}</span>
              <span className="text-xs text-white/40 mr-2">{sym}{payment.amountDue.toFixed(0)}</span>
              <button
                onClick={() => togglePayment(payment)}
                disabled={loading === payment.id}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all border ${
                  payment.status === "PAID"
                    ? "bg-emerald-500/20 border-emerald-400/30 text-emerald-300"
                    : "bg-white/10 border-white/20 text-white/50 hover:text-white"
                }`}
              >
                {loading === payment.id ? "..." : payment.status === "PAID" ? "✓ Paid" : "Mark Paid"}
              </button>
            </div>
          ))}
        </GlassCard>
      )}
    </div>
  );
}
