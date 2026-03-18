import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getGroupByCode } from "@/actions/groups";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ groupCode: string }> }
) {
  const { groupCode } = await params;
  const group = await getGroupByCode(groupCode);
  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { adminEmail } = await req.json();
  const updated = await prisma.group.update({
    where: { id: group.id },
    data: { adminEmail: adminEmail?.trim().toLowerCase() || null },
  });

  return NextResponse.json({ ok: true, group: updated });
}
