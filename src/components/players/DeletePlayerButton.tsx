"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { archiveOrDeletePlayer } from "@/actions/players";
import { GlassButton } from "@/components/ui/GlassButton";

interface DeletePlayerButtonProps {
  playerId: string;
  playerName: string;
  groupCode: string;
}

export function DeletePlayerButton({ playerId, playerName, groupCode }: DeletePlayerButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      const result = await archiveOrDeletePlayer(playerId, groupCode);
      if (result.archived) {
        alert(`${playerName} has been archived. They will no longer appear in active lists but their match history is preserved.`);
      }
      router.push(`/g/${groupCode}/players`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-red-400/70 hover:text-red-400 text-sm transition-colors"
      >
        Delete / Archive
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative glass rounded-2xl p-6 max-w-sm w-full border border-white/20 space-y-4">
            <h3 className="text-lg font-bold text-white">Remove {playerName}?</h3>
            <div className="space-y-2 text-sm text-white/60">
              <p>If this player has match history, they will be <strong className="text-white/80">archived</strong> — hidden from active lists but preserved in all historical records.</p>
              <p>If they have no history, they will be <strong className="text-white/80">permanently deleted</strong>.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2 rounded-xl glass text-white/60 hover:text-white transition-colors text-sm"
              >
                Cancel
              </button>
              <GlassButton
                onClick={handleConfirm}
                loading={loading}
                className="flex-1 bg-red-500/20 border-red-400/30 text-red-300 hover:bg-red-500/30"
              >
                Confirm
              </GlassButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
