import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateGroupCode } from "@/lib/group";

export async function POST(req: Request) {
  try {
    const { name, sport, clubName } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }

    const validSports = ["TABLE_TENNIS", "PADEL", "SQUASH"];
    const groupSport = validSports.includes(sport) ? sport : "TABLE_TENNIS";

    let code = generateGroupCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.group.findUnique({ where: { code } });
      if (!existing) break;
      code = generateGroupCode();
      attempts++;
    }

    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        code,
        sport: groupSport,
        clubName: clubName?.trim() || null,
      },
    });

    return NextResponse.json({ code: group.code, id: group.id, name: group.name, sport: group.sport });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
  }
}
