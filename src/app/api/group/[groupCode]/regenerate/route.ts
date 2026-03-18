import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateGroupCode } from "@/lib/group";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ groupCode: string }> }
) {
  const { groupCode } = await params;
  const group = await prisma.group.findUnique({ where: { code: groupCode.toUpperCase() } });
  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let newCode = generateGroupCode();
  while (await prisma.group.findUnique({ where: { code: newCode } })) {
    newCode = generateGroupCode();
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  await prisma.group.update({
    where: { id: group.id },
    data: {
      code: newCode,
      previousCode: group.code,
      previousCodeExpiresAt: expiresAt,
    },
  });

  return NextResponse.json({ newCode, oldCode: group.code, expiresAt });
}
