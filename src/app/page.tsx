import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { createGroup, joinGroup } from "@/actions/groups";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🏓</div>
          <h1 className="text-4xl font-bold gradient-text">Table Tennis</h1>
          <p className="text-white/40 mt-2 text-sm">Tournament & League Manager</p>
        </div>

        {/* Create Group */}
        <GlassCard>
          <h2 className="text-lg font-semibold text-white mb-4">Create a Group</h2>
          <form action={createGroup} className="space-y-3">
            <GlassInput
              name="name"
              placeholder="e.g. Holiday Extras, Friends..."
              label="Group Name"
              required
            />
            <GlassButton type="submit" className="w-full" size="lg">
              Create Group
            </GlassButton>
          </form>
        </GlassCard>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-xs">or join existing</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Join Group */}
        <GlassCard>
          <h2 className="text-lg font-semibold text-white mb-4">Join a Group</h2>
          <form action={joinGroup} className="space-y-3">
            <GlassInput
              name="code"
              placeholder="Enter 6-letter code"
              label="Group Code"
              maxLength={6}
              style={{ textTransform: "uppercase", letterSpacing: "0.2em" }}
              required
            />
            <GlassButton type="submit" variant="ghost" className="w-full" size="lg">
              Join Group
            </GlassButton>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
