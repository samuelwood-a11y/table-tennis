"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Group } from "@prisma/client";

interface GroupNavProps {
  group: Group;
}

const navItems = [
  { href: "", icon: "🏠", label: "Home" },
  { href: "/players", icon: "👤", label: "Players" },
  { href: "/matches", icon: "🏓", label: "Matches" },
  { href: "/leagues", icon: "📊", label: "Leagues" },
  { href: "/tournaments", icon: "🏆", label: "Tournaments" },
  { href: "/generator", icon: "🎲", label: "Generator" },
  { href: "/stats", icon: "📈", label: "Stats" },
  { href: "/settings", icon: "⚙️", label: "Settings" },
];

export function GroupNav({ group }: GroupNavProps) {
  const pathname = usePathname();
  const base = `/g/${group.code}`;

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 h-screen w-60 flex-col glass border-r border-white/10 z-40">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🏓</span>
            <span className="font-bold text-white text-lg">Table Tennis</span>
          </div>
          <div className="text-xs text-white/40 mt-1">{group.name}</div>
          <code className="text-xs text-violet-300 font-mono bg-violet-500/10 px-1.5 py-0.5 rounded mt-1 inline-block">
            {group.code}
          </code>
        </div>

        <div className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const href = `${base}${item.href}`;
            const isActive = item.href === ""
              ? pathname === base
              : pathname.startsWith(href);

            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/50 hover:text-white hover:bg-white/8"
                )}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-white/10">
          <Link href="/" className="text-xs text-white/30 hover:text-white/60 transition-colors flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Switch Group
          </Link>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/10">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.slice(0, 6).map((item) => {
            const href = `${base}${item.href}`;
            const isActive = item.href === ""
              ? pathname === base
              : pathname.startsWith(href);

            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all",
                  isActive ? "text-white" : "text-white/40"
                )}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
