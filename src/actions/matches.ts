"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type SetInput = { score1: number; score2: number };

export async function createSinglesMatch(
  groupId: string,
  player1Id: string,
  player2Id: string,
  sets: SetInput[],
  leagueId?: string,
  tournamentId?: string,
  bracketRound?: number,
  bracketPosition?: number
) {
  const match = await prisma.$transaction(async (tx) => {
    const m = await tx.match.create({
      data: {
        groupId,
        type: "SINGLES",
        status: sets.length > 0 ? "COMPLETED" : "PENDING",
        player1Id,
        player2Id,
        leagueId,
        tournamentId,
        bracketRound,
        bracketPosition,
      },
    });

    if (sets.length > 0) {
      await tx.set.createMany({
        data: sets.map((s, i) => ({
          matchId: m.id,
          setNumber: i + 1,
          score1: s.score1,
          score2: s.score2,
        })),
      });
    }

    return m;
  });

  revalidatePath(`/g`);

  // If part of tournament, advance bracket
  if (tournamentId && bracketRound !== undefined && bracketPosition !== undefined) {
    await advanceBracket(match.id, tournamentId, bracketRound, bracketPosition, sets);
  }

  return match;
}

export async function createDoublesMatch(
  groupId: string,
  team1PlayerIds: [string, string],
  team2PlayerIds: [string, string],
  sets: SetInput[],
  leagueId?: string
) {
  const [team1, team2] = await Promise.all([
    findOrCreateDoublesTeam(groupId, team1PlayerIds),
    findOrCreateDoublesTeam(groupId, team2PlayerIds),
  ]);

  const match = await prisma.$transaction(async (tx) => {
    const m = await tx.match.create({
      data: {
        groupId,
        type: "DOUBLES",
        status: sets.length > 0 ? "COMPLETED" : "PENDING",
        team1Id: team1.id,
        team2Id: team2.id,
        leagueId,
      },
    });

    if (sets.length > 0) {
      await tx.set.createMany({
        data: sets.map((s, i) => ({
          matchId: m.id,
          setNumber: i + 1,
          score1: s.score1,
          score2: s.score2,
        })),
      });
    }

    return m;
  });

  revalidatePath(`/g`);
  return match;
}

async function findOrCreateDoublesTeam(groupId: string, playerIds: [string, string]) {
  const [p1, p2] = playerIds.sort();

  // Find existing team with same players
  const existing = await prisma.doublesTeam.findFirst({
    where: {
      groupId,
      players: {
        every: { playerId: { in: [p1, p2] } },
      },
    },
    include: { players: true },
  });

  if (existing && existing.players.length === 2) return existing;

  return prisma.doublesTeam.create({
    data: {
      groupId,
      players: {
        create: [{ playerId: p1 }, { playerId: p2 }],
      },
    },
  });
}

export async function updateMatchSets(matchId: string, sets: SetInput[]) {
  await prisma.$transaction(async (tx) => {
    await tx.set.deleteMany({ where: { matchId } });
    await tx.set.createMany({
      data: sets.map((s, i) => ({
        matchId,
        setNumber: i + 1,
        score1: s.score1,
        score2: s.score2,
      })),
    });
    await tx.match.update({
      where: { id: matchId },
      data: { status: sets.length > 0 ? "COMPLETED" : "PENDING" },
    });
  });

  revalidatePath(`/g`);
}

export async function deleteMatch(matchId: string) {
  await prisma.match.delete({ where: { id: matchId } });
  revalidatePath(`/g`);
}

async function advanceBracket(
  matchId: string,
  tournamentId: string,
  bracketRound: number,
  bracketPosition: number,
  sets: SetInput[]
) {
  const { getMatchWinner } = await import("@/lib/stats");
  const fakeSets = sets.map((s, i) => ({ id: "", matchId, setNumber: i + 1, ...s }));
  const winner = getMatchWinner(fakeSets);
  if (winner === 0) return;

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { player1Id: true, player2Id: true },
  });
  if (!match) return;

  const winnerId = winner === 1 ? match.player1Id : match.player2Id;
  if (!winnerId) return;

  const nextRound = bracketRound + 1;
  const nextPosition = Math.ceil(bracketPosition / 2);
  const isFirstSlot = bracketPosition % 2 === 1;

  const nextMatch = await prisma.match.findFirst({
    where: { tournamentId, bracketRound: nextRound, bracketPosition: nextPosition },
  });

  if (nextMatch) {
    await prisma.match.update({
      where: { id: nextMatch.id },
      data: isFirstSlot ? { player1Id: winnerId } : { player2Id: winnerId },
    });
  } else {
    // Create next round match stub
    await prisma.match.create({
      data: {
        groupId: (await prisma.tournament.findUnique({ where: { id: tournamentId }, select: { groupId: true } }))!.groupId,
        type: "SINGLES",
        status: "PENDING",
        tournamentId,
        bracketRound: nextRound,
        bracketPosition: nextPosition,
        player1Id: isFirstSlot ? winnerId : undefined,
        player2Id: isFirstSlot ? undefined : winnerId,
      },
    });
  }
}
