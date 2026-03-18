import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { groupId, name, avatarColor, emoji } = await req.json();
  if (!groupId || !name?.trim()) {
    return NextResponse.json({ error: "groupId and name required" }, { status: 400 });
  }

  const player = await prisma.player.create({
    data: {
      groupId,
      name: name.trim(),
      avatarColor: avatarColor ?? "#6366f1",
      emoji: emoji ?? null,
    },
  });

  return NextResponse.json({ player });
}
