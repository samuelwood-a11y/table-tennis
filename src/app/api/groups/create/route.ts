import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateGroupCode } from "@/lib/group";

export async function POST(req: Request) {
  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  let code = generateGroupCode();
  let existing = await prisma.group.findUnique({ where: { code } });
  while (existing) {
    code = generateGroupCode();
    existing = await prisma.group.findUnique({ where: { code } });
  }

  const group = await prisma.group.create({ data: { name: name.trim(), code } });
  return NextResponse.json({ code: group.code, id: group.id, name: group.name });
}
