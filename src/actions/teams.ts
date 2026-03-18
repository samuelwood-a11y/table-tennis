"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTeam(
  groupId: string,
  data: {
    name: string;
    primaryColor?: string;
    secondaryColor?: string | null;
    imageUrl?: string | null;
  }
) {
  if (!data.name?.trim()) throw new Error("Team name required");
  const team = await prisma.team.create({
    data: {
      groupId,
      name: data.name.trim(),
      primaryColor: data.primaryColor ?? "#6366f1",
      secondaryColor: data.secondaryColor ?? null,
      imageUrl: data.imageUrl ?? null,
    },
  });
  revalidatePath(`/g`);
  return team;
}

export async function updateTeam(
  teamId: string,
  data: {
    name?: string;
    primaryColor?: string;
    secondaryColor?: string | null;
    imageUrl?: string | null;
  }
) {
  const team = await prisma.team.update({
    where: { id: teamId },
    data,
  });
  revalidatePath(`/g`);
  return team;
}

export async function addPlayerToTeam(teamId: string, playerId: string) {
  await prisma.teamPlayer.upsert({
    where: { teamId_playerId: { teamId, playerId } },
    update: {},
    create: { teamId, playerId },
  });
  revalidatePath(`/g`);
}

export async function removePlayerFromTeam(teamId: string, playerId: string) {
  await prisma.teamPlayer.delete({
    where: { teamId_playerId: { teamId, playerId } },
  });
  revalidatePath(`/g`);
}

export async function archiveOrDeleteTeam(teamId: string, groupCode: string) {
  const matchCount = await prisma.match.count({
    where: {
      type: "TEAM",
      status: "COMPLETED",
      OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
    },
  });

  if (matchCount > 0) {
    await prisma.team.update({
      where: { id: teamId },
      data: { isArchived: true, archivedAt: new Date() },
    });
  } else {
    await prisma.team.delete({ where: { id: teamId } });
  }

  revalidatePath(`/g/${groupCode}/teams`);
  return { archived: matchCount > 0 };
}

export async function createTeamMatch(
  groupId: string,
  homeTeamId: string,
  awayTeamId: string,
  homeScore: number,
  awayScore: number,
  options?: { leagueId?: string; tournamentId?: string; venue?: string }
) {
  const match = await prisma.$transaction(async (tx) => {
    const m = await tx.match.create({
      data: {
        groupId,
        type: "TEAM",
        status: "COMPLETED",
        homeTeamId,
        awayTeamId,
        leagueId: options?.leagueId,
        tournamentId: options?.tournamentId,
        venue: options?.venue,
      },
    });
    await tx.set.create({
      data: { matchId: m.id, setNumber: 1, score1: homeScore, score2: awayScore },
    });
    return m;
  });
  revalidatePath(`/g`);
  return match;
}

export async function createTeamLeague(
  groupId: string,
  name: string,
  teamIds: string[],
  options?: {
    entryFee?: number;
    currency?: string;
    expectedPot?: number;
    pointsConfig?: { win: number; draw: number; loss: number };
    teamSize?: number;
    prizeRows?: { position: number; label: string; amount: number }[];
  }
) {
  if (!name?.trim()) throw new Error("League name required");
  if (teamIds.length < 2) throw new Error("At least 2 teams required");

  const pointsJson = options?.pointsConfig
    ? JSON.stringify(options.pointsConfig)
    : null;

  const league = await prisma.$transaction(async (tx) => {
    const l = await tx.league.create({
      data: {
        groupId,
        name: name.trim(),
        format: "TEAM",
        entryFee: options?.entryFee ?? null,
        currency: options?.currency ?? "GBP",
        expectedPot: options?.expectedPot ?? null,
        pointsConfig: pointsJson,
        teamSize: options?.teamSize ?? null,
      },
    });

    // Add teams
    await tx.leagueTeam.createMany({
      data: teamIds.map((teamId) => ({ leagueId: l.id, teamId })),
    });

    // Generate round-robin fixtures (each pair plays once)
    const fixtures: { homeTeamId: string; awayTeamId: string }[] = [];
    for (let i = 0; i < teamIds.length; i++) {
      for (let j = i + 1; j < teamIds.length; j++) {
        fixtures.push({ homeTeamId: teamIds[i], awayTeamId: teamIds[j] });
      }
    }

    await tx.match.createMany({
      data: fixtures.map((f) => ({
        groupId,
        type: "TEAM",
        status: "PENDING",
        leagueId: l.id,
        homeTeamId: f.homeTeamId,
        awayTeamId: f.awayTeamId,
      })),
    });

    // Prize rows
    if (options?.prizeRows?.length) {
      await tx.prizePayoutRow.createMany({
        data: options.prizeRows.map((r) => ({
          leagueId: l.id,
          position: r.position,
          label: r.label,
          amount: r.amount,
        })),
      });
    }

    return l;
  });

  revalidatePath(`/g`);
  return league;
}
