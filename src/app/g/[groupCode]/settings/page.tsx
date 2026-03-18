"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassBadge } from "@/components/ui/GlassBadge";

export default function GroupSettingsPage({
  params,
}: {
  params: Promise<{ groupCode: string }>;
}) {
  const { groupCode } = use(params);
  const router = useRouter();
  const [group, setGroup] = useState<{ id: string; name: string; code: string; adminEmail?: string } | null>(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/group/${groupCode}`)
      .then((r) => r.json())
      .then(({ group }) => {
        setGroup(group);
        setAdminEmail(group.adminEmail ?? "");
      });
  }, [groupCode]);

  async function saveAdminEmail() {
    if (!group) return;
    setSaving(true);
    await fetch(`/api/group/${groupCode}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminEmail }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function regenerateCode() {
    if (!confirm("Generate a new group code? The old code will remain valid for 24 hours.")) return;
    setRegenerating(true);
    const res = await fetch(`/api/group/${groupCode}/regenerate`, { method: "POST" });
    const data = await res.json();
    if (data.newCode) {
      setNewCode(data.newCode);
      setGroup((g) => g ? { ...g, code: data.newCode } : g);
      router.replace(`/g/${data.newCode}/settings`);
    }
    setRegenerating(false);
  }

  function copyCode() {
    if (!group) return;
    navigator.clipboard.writeText(group.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!group) {
    return <div className="flex items-center justify-center h-48"><div className="text-white/30">Loading...</div></div>;
  }

  return (
    <div className="space-y-6 max-w-lg">
      <PageHeader title="Group Settings" backHref={`/g/${groupCode}`} />

      {/* Group Code */}
      <GlassCard>
        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-4">Group Code</h3>
        <div className="flex items-center gap-3 mb-4">
          <code className="text-3xl font-bold text-violet-300 tracking-widest font-mono">
            {group.code}
          </code>
          <GlassButton size="sm" variant="ghost" onClick={copyCode}>
            {copied ? "✓ Copied" : "Copy"}
          </GlassButton>
        </div>
        <p className="text-xs text-white/40 mb-4">
          Share this code with players so they can join your group.
        </p>
        <GlassButton
          size="sm"
          variant="danger"
          onClick={regenerateCode}
          loading={regenerating}
        >
          🔄 Regenerate Code
        </GlassButton>
        {newCode && (
          <p className="text-xs text-amber-400 mt-2">
            Old code is still valid for 24 hours.
          </p>
        )}
      </GlassCard>

      {/* Admin Email */}
      <GlassCard>
        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-4">
          Recovery Email
        </h3>
        <p className="text-xs text-white/40 mb-4">
          If someone forgets the group code, this email address will receive it. Used for the "Forgot group code?" flow.
        </p>
        <div className="space-y-3">
          <GlassInput
            label="Admin Email"
            type="email"
            placeholder="you@example.com"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
          />
          <GlassButton onClick={saveAdminEmail} loading={saving} size="sm">
            {saved ? "✓ Saved" : "Save Email"}
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
}
