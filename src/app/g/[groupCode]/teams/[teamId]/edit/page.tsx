"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassButton } from "@/components/ui/GlassButton";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { TeamAvatar } from "@/components/teams/TeamAvatar";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { updateTeam, addPlayerToTeam, removePlayerFromTeam, archiveOrDeleteTeam } from "@/actions/teams";

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#ffffff",
  "#64748b", "#1e293b",
];

export default function EditTeamPage({
  params,
}: {
  params: Promise<{ groupCode: string; teamId: string }>;
}) {
  const { groupCode, teamId } = use(params);
  const router = useRouter();

  const [name, setName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#ef4444");
  const [secondaryColor, setSecondaryColor] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [teamPlayers, setTeamPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    // Fetch team data
    fetch(`/api/group/${groupCode}/teams`)
      .then((r) => r.json())
      .then(({ teams }) => {
        const t = teams?.find((t: any) => t.id === teamId);
        if (t) {
          setName(t.name);
          setPrimaryColor(t.primaryColor);
          setSecondaryColor(t.secondaryColor ?? null);
          setImageUrl(t.imageUrl ?? null);
          setTeamPlayers(t.players?.map((tp: any) => tp.playerId ?? tp.player?.id) ?? []);
        }
      });
    // Fetch all players
    fetch(`/api/group/${groupCode}/players`)
      .then((r) => r.json())
      .then(({ players }) => setAllPlayers((players || []).filter((p: any) => !p.isArchived)));
  }, [groupCode, teamId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await updateTeam(teamId, { name: name.trim(), primaryColor, secondaryColor, imageUrl });
      router.push(`/g/${groupCode}/teams/${teamId}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
      setLoading(false);
    }
  }

  async function togglePlayer(playerId: string) {
    const inTeam = teamPlayers.includes(playerId);
    if (inTeam) {
      await removePlayerFromTeam(teamId, playerId);
      setTeamPlayers((prev) => prev.filter((id) => id !== playerId));
    } else {
      await addPlayerToTeam(teamId, playerId);
      setTeamPlayers((prev) => [...prev, playerId]);
    }
  }

  async function handleDelete() {
    if (!confirm(`Remove this team? If they have match history, they will be archived.`)) return;
    setDeleteLoading(true);
    try {
      await archiveOrDeleteTeam(teamId, groupCode);
      router.push(`/g/${groupCode}/teams`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
      setDeleteLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Edit Team" backHref={`/g/${groupCode}/teams/${teamId}`} />
      <form onSubmit={handleSave} className="space-y-5 max-w-lg mt-6">

        {/* Badge */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-4">Team Badge</h3>
          <div className="flex items-center gap-6">
            <TeamAvatar name={name || "T"} primaryColor={primaryColor} imageUrl={imageUrl} size="xl" />
            <ImageUpload
              currentUrl={imageUrl}
              onUpload={setImageUrl}
              onRemove={() => setImageUrl(null)}
              shape="rounded"
              size="md"
              placeholder="🏅"
            />
          </div>
        </GlassCard>

        {/* Name */}
        <GlassCard>
          <GlassInput
            label="Team Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </GlassCard>

        {/* Colours */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-4">Team Colours</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-white/40 mb-2">Primary colour</p>
              <div className="flex gap-2 flex-wrap">
                {PRESET_COLORS.map((color) => (
                  <button key={color} type="button" onClick={() => setPrimaryColor(color)}
                    className={`w-8 h-8 rounded-full transition-all border-2 ${primaryColor === color ? "border-white scale-110" : "border-white/20"}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-2">Secondary colour (optional)</p>
              <div className="flex gap-2 flex-wrap">
                <button type="button" onClick={() => setSecondaryColor(null)}
                  className={`w-8 h-8 rounded-full transition-all border-2 flex items-center justify-center text-white/30 ${!secondaryColor ? "border-white bg-white/10" : "border-white/20 bg-white/5"}`}>
                  —
                </button>
                {PRESET_COLORS.map((color) => (
                  <button key={color} type="button" onClick={() => setSecondaryColor(color)}
                    className={`w-8 h-8 rounded-full transition-all border-2 ${secondaryColor === color ? "border-white scale-110" : "border-white/20"}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Squad */}
        {allPlayers.length > 0 && (
          <GlassCard>
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-3">
              Squad {teamPlayers.length > 0 && <span className="text-violet-400 font-normal normal-case">({teamPlayers.length})</span>}
            </h3>
            <div className="space-y-1.5">
              {allPlayers.map((p) => {
                const inTeam = teamPlayers.includes(p.id);
                return (
                  <button key={p.id} type="button" onClick={() => togglePlayer(p.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${inTeam ? "bg-violet-500/20 border border-violet-400/40 text-white" : "glass glass-hover text-white/70"}`}
                  >
                    <PlayerAvatar name={p.name} avatarColor={p.avatarColor} emoji={p.emoji} imageUrl={p.imageUrl} size="sm" />
                    <span className="flex-1 text-left">{p.name}</span>
                    {inTeam && <span className="text-violet-400 text-xs">✓</span>}
                  </button>
                );
              })}
            </div>
          </GlassCard>
        )}

        <GlassButton type="submit" loading={loading} className="w-full" size="lg">
          Save Changes
        </GlassButton>

        {/* Danger zone */}
        <GlassCard className="border border-red-400/10">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-3">Danger Zone</h3>
          <GlassButton
            type="button"
            onClick={handleDelete}
            loading={deleteLoading}
            className="bg-red-500/20 border-red-400/30 text-red-300 hover:bg-red-500/30"
          >
            Delete / Archive Team
          </GlassButton>
        </GlassCard>
      </form>
    </div>
  );
}
