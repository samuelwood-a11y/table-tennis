import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getGroupByCode } from "@/actions/groups";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ groupCode: string }> }
) {
  const { groupCode } = await params;
  const group = await getGroupByCode(groupCode);
  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const players = await prisma.player.findMany({
    where: { groupId: group.id },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ players });
}
