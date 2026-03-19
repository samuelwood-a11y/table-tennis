"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SportBadge } from "@/components/ui/SportBadge";
import { getSportConfig } from "@/lib/sports";

interface Group {
  id: string;
  name: string;
  code: string;
  sport?: string;
  [key: string]: unknown;
}

interface NavItem {
  href: string;
  icon: string;
  label: string;
}

export function GroupNav({ group }: { group: Group }) {
  const pathname = usePathname();
  const sport = (group.sport as string) ?? "TABLE_TENNIS";
  const sportConfig = getSportConfig(sport);
  const base = `/g/${group.code}`;

  const navItems: NavItem[] = [
    { href: base, icon: "🏠", label: "Home" },
    ...(sportConfig.isTeamSport
      ? [{ href: `${base}/teams`, icon: "👥", label: "Teams" }]
      : []),
    { href: `${base}/players`, icon: "👤", label: "Players" },
    { href: `${base}/matches`, icon: sportConfig.matchIcon, label: "Matches" },
    { href: `${base}/leagues`, icon: "📊", label: "Leagues" },
    { href: `${base}/tournaments`, icon: "🏆", label: "Tournaments" },
    ...(sport === "TABLE_TENNIS" ? [{ href: `${base}/generator`, icon: "🎲", label: "Generator" }] : []),
    { href: `${base}/stats`, icon: "📈", label: "Stats" },
    { href: `${base}/settings`, icon: "⚙️", label: "Settings" },
  ];

  function isActive(href: string) {
    if (href === base) return pathname === base;
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-60 glass border-r border-white/10 z-40">
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="block">
            <p className="text-xs text-white/40 mb-0.5">MatchHub</p>
            <h2 className="font-bold text-white text-lg leading-tight truncate">{group.name}</h2>
          </Link>
          <div className="mt-2">
            <SportBadge sport={sport} size="sm" />
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium",
                  isActive(item.href)
                    ? "bg-white/15 text-white"
                    : "text-white/50 hover:text-white hover:bg-white/8"
                )}
              >
                <span className="text-base w-5 text-center">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link href="/" className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors">
            <span>←</span>
            <span>Switch Group</span>
          </Link>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10">
        <div className="flex items-center justify-around px-2 py-2">
          <Link href="/">
            <div className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-[44px] text-white/40 hover:text-white/70">
              <span className="text-lg">←</span>
              <span className="text-[10px] font-medium">All</span>
            </div>
          </Link>
          {navItems.slice(0, 5).map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-[44px]",
                  isActive(item.href) ? "text-white" : "text-white/40"
                )}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-[10px] font-medium">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
