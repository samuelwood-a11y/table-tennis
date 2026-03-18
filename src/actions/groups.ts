"use server";

import { prisma } from "@/lib/prisma";
import { generateGroupCode } from "@/lib/group";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createGroup(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name?.trim()) throw new Error("Group name required");

  let code = generateGroupCode();
  // Ensure uniqueness
  let existing = await prisma.group.findUnique({ where: { code } });
  while (existing) {
    code = generateGroupCode();
    existing = await prisma.group.findUnique({ where: { code } });
  }

  const group = await prisma.group.create({ data: { name: name.trim(), code } });
  revalidatePath("/");
  redirect(`/g/${group.code}`);
}

export async function joinGroup(formData: FormData) {
  const code = (formData.get("code") as string)?.toUpperCase().trim();
  if (!code) throw new Error("Code required");

  const group = await prisma.group.findUnique({ where: { code } });
  if (!group) throw new Error("Group not found");

  redirect(`/g/${group.code}`);
}

export async function getGroupByCode(code: string) {
  return prisma.group.findUnique({ where: { code: code.toUpperCase() } });
}
