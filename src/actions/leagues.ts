"use server";

import { prisma } from "@/lib/prisma";
import { generateRoundRobin } from "@/lib/round-robin";
import { generateRotatingDoublesFixtures } from "@/lib/rotating-doubles";
import { revalidatePath } from "next/cache";

export type PrizeRow = { position: number; label: string; amount?: number; percentage?: number };

export async function createLeague(
  groupId: string,
  name: string,
  playerIds: string[],
  options?: {
    format?: string;
    entryFee?: number;
    currency?: string;
    expectedPot?: number;
    prizeRows?: PrizeRow[];
    cycles?: number;
  }
) {
  if (playerIds.length < 2) throw new Error("Need at least 2 players");
  const format = options?.format ?? "SINGLES";

  const league = await prisma.$transaction(async (tx) => {
    const l = await tx.league.create({
      data: {
        groupId,
        name,
        format,
        entryFee: options?.entryFee,
        currency: options?.currency ?? "GBP",
        expectedPot: options?.expectedPot,
        players: { create: playerIds.map((id) => ({ playerId: id })) },
      },
    });

    if (options?.prizeRows?.length) {
      await tx.prizePayoutRow.createMany({
        data: options.prizeRows.map((r) => ({
          leagueId: l.id,
          position: r.position,
          label: r.label,
          amount: r.amount,
          percentage: r.percentage,
        })),
      });
    }

    // Create player payment records if entry fee set
    if (options?.entryFee && options.entryFee > 0) {
      await tx.playerPayment.createMany({
        data: playerIds.map((pid) => ({
          playerId: pid,
          leagueId: l.id,
          amountDue: options.entryFee!,
          status: "UNPAID",
        })),
      });
    }

    if (format === "ROTATING_DOUBLES") {
      const fixtures = generateRotatingDoublesFixtures(playerIds, options?.cycles ?? 3);
      for (const f of fixtures) {
        // Find or create doubles teams
        const [t1, t2] = await Promise.all([
          findOrCreateDoublesTeam(groupId, f.team1PlayerIds, tx),
          findOrCreateDoublesTeam(groupId, f.team2PlayerIds, tx),
        ]);
        await tx.match.create({
          data: {
            groupId,
            type: "DOUBLES",
            status: "PENDING",
            leagueId: l.id,
            refereeId: f.refereeId,
            team1Id: t1.id,
            team2Id: t2.id,
          },
        });
      }
    } else if (format === "SINGLES" || format === "DOUBLES") {
      const fixtures = generateRoundRobin(playerIds.length);
      await tx.match.createMany({
        data: fixtures.map(([i, j]) => ({
          groupId,
          type: format === "DOUBLES" ? "DOUBLES" : "SINGLES",
          status: "PENDING",
          player1Id: format === "SINGLES" ? playerIds[i] : undefined,
          player2Id: format === "SINGLES" ? playerIds[j] : undefined,
          leagueId: l.id,
        })),
      });
    }

    return l;
  });

  revalidatePath(`/g`);
  return league;
}

async function findOrCreateDoublesTeam(
  groupId: string,
  playerIds: [string, string],
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
) {
  const [p1, p2] = [...playerIds].sort();
  const existing = await tx.doublesTeam.findFirst({
    where: { groupId, players: { every: { playerId: { in: [p1, p2] } } } },
    include: { players: true },
  });
  if (existing && existing.players.length === 2) return existing;
  return tx.doublesTeam.create({
    data: { groupId, players: { create: [{ playerId: p1 }, { playerId: p2 }] } },
  });
}

export async function updatePlayerPayment(
  paymentId: string,
  data: { status?: string; amountPaid?: number; paidAt?: Date | null; notes?: string }
) {
  await prisma.playerPayment.update({ where: { id: paymentId }, data });
  revalidatePath(`/g`);
}

export async function completeLeague(leagueId: string) {
  await prisma.league.update({ where: { id: leagueId }, data: { status: "COMPLETED" } });
  revalidatePath(`/g`);
}

export async function deleteLeague(leagueId: string) {
  await prisma.league.delete({ where: { id: leagueId } });
  revalidatePath(`/g`);
}

export async function archiveLeague(leagueId: string, groupCode: string) {
  await prisma.league.update({
    where: { id: leagueId },
    data: { isArchived: true },
  });
  revalidatePath(`/g/${groupCode}/leagues`);
}

export async function deleteLeagueIfEmpty(leagueId: string, groupCode: string) {
  const hasResults = await prisma.match.count({
    where: { leagueId, status: "COMPLETED" },
  });
  if (hasResults > 0) throw new Error("Cannot delete league with results. Use archive instead.");
  await prisma.league.delete({ where: { id: leagueId } });
  revalidatePath(`/g/${groupCode}/leagues`);
}
