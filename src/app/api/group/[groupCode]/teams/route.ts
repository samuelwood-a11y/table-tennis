import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ groupCode: string }> }
) {
  try {
    const { groupCode } = await params;
    const group = await prisma.group.findFirst({
      where: {
        OR: [
          { code: groupCode },
          { previousCode: groupCode },
        ],
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const teams = await prisma.team.findMany({
      where: { groupId: group.id, isArchived: false },
      include: {
        players: {
          include: { player: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ teams });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
