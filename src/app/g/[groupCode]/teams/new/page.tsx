"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassButton } from "@/components/ui/GlassButton";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { TeamAvatar } from "@/components/teams/TeamAvatar";
import { createTeam } from "@/actions/teams";

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#ffffff",
  "#64748b", "#1e293b",
];

export default function NewTeamPage({
  params,
}: {
  params: Promise<{ groupCode: string }>;
}) {
  const { groupCode } = use(params);
  const router = useRouter();
  const [name, setName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#ef4444");
  const [secondaryColor, setSecondaryColor] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [groupId, setGroupId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/group/${groupCode}`)
      .then((r) => r.json())
      .then(({ groupId }) => setGroupId(groupId));
  }, [groupCode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const team = await createTeam(groupId, {
        name: name.trim(),
        primaryColor,
        secondaryColor: secondaryColor ?? undefined,
        imageUrl,
      });
      router.push(`/g/${groupCode}/teams/${team.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="New Team" backHref={`/g/${groupCode}/teams`} />
      <form onSubmit={handleSubmit} className="space-y-5 max-w-lg mt-6">

        {/* Badge upload */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-4">Team Badge</h3>
          <div className="flex items-center gap-6">
            {imageUrl ? (
              <ImageUpload
                currentUrl={imageUrl}
                onUpload={setImageUrl}
                onRemove={() => setImageUrl(null)}
                shape="rounded"
                size="lg"
              />
            ) : (
              <TeamAvatar name={name || "T"} primaryColor={primaryColor} size="xl" />
            )}
            {!imageUrl && (
              <div className="flex-1">
                <ImageUpload
                  currentUrl={null}
                  onUpload={setImageUrl}
                  shape="rounded"
                  size="sm"
                  placeholder="🏅"
                />
              </div>
            )}
          </div>
        </GlassCard>

        {/* Name */}
        <GlassCard>
          <GlassInput
            label="Team Name"
            placeholder="e.g. Red Devils, City FC..."
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
                  <button
                    key={color}
                    type="button"
                    onClick={() => setPrimaryColor(color)}
                    className={`w-8 h-8 rounded-full transition-all border-2 ${
                      primaryColor === color ? "border-white scale-110" : "border-white/20"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-white/40 mb-2">Secondary colour (optional)</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSecondaryColor(null)}
                  className={`w-8 h-8 rounded-full transition-all border-2 flex items-center justify-center text-white/30 ${
                    !secondaryColor ? "border-white bg-white/10" : "border-white/20 bg-white/5"
                  }`}
                >
                  —
                </button>
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSecondaryColor(color)}
                    className={`w-8 h-8 rounded-full transition-all border-2 ${
                      secondaryColor === color ? "border-white scale-110" : "border-white/20"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className="flex gap-1">
              <div className="w-6 h-6 rounded-full border-2 border-white/20" style={{ backgroundColor: primaryColor }} />
              {secondaryColor && (
                <div className="w-6 h-6 rounded-full border-2 border-white/20" style={{ backgroundColor: secondaryColor }} />
              )}
            </div>
            <span className="text-sm text-white/60">{name || "Team Name"}</span>
          </div>
        </GlassCard>

        <GlassButton type="submit" loading={loading} className="w-full" size="lg">
          Create Team
        </GlassButton>
      </form>
    </div>
  );
}
