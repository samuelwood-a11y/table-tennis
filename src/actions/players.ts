"use server";

import { prisma } from "@/lib/prisma";
import { randomAvatarColor } from "@/lib/group";
import { revalidatePath } from "next/cache";

export async function createPlayer(groupId: string, name: string, avatarColor?: string) {
  if (!name?.trim()) throw new Error("Player name required");

  const player = await prisma.player.create({
    data: {
      groupId,
      name: name.trim(),
      avatarColor: avatarColor ?? randomAvatarColor(),
    },
  });

  revalidatePath(`/g`);
  return player;
}

export async function updatePlayer(
  playerId: string,
  data: { name?: string; avatarColor?: string }
) {
  const player = await prisma.player.update({
    where: { id: playerId },
    data,
  });
  revalidatePath(`/g`);
  return player;
}

export async function deletePlayer(playerId: string, groupCode: string) {
  await prisma.player.delete({ where: { id: playerId } });
  revalidatePath(`/g/${groupCode}/players`);
}
