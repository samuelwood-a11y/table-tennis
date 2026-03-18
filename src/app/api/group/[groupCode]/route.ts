import { NextResponse } from "next/server";
import { getGroupByCode } from "@/actions/groups";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ groupCode: string }> }
) {
  const { groupCode } = await params;
  const group = await getGroupByCode(groupCode);
  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ groupId: group.id, group });
}
