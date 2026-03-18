"use client";

import { GlassButton } from "@/components/ui/GlassButton";
import { deleteMatch } from "@/actions/matches";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteMatchButton({ matchId, groupCode }: { matchId: string; groupCode: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm) { setConfirm(true); return; }
    setLoading(true);
    await deleteMatch(matchId);
    router.push(`/g/${groupCode}/matches`);
  }

  return (
    <GlassButton
      variant="danger"
      onClick={handleDelete}
      loading={loading}
      className="w-full"
    >
      {confirm ? "Tap again to confirm delete" : "Delete Match"}
    </GlassButton>
  );
}
