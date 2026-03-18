import { PrismaClient } from "@prisma/client";
// @ts-ignore
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter, log: ["error", "warn"] } as never);

async function main() {
  console.log("🌱 Seeding database...");

  // Create group
  const group = await prisma.group.create({
    data: {
      name: "Holiday Extras",
      code: "PING42",
    },
  });

  // Create players
  const playerData = [
    { name: "Alex Chen", avatarColor: "#6366f1" },
    { name: "Sarah Park", avatarColor: "#ec4899" },
    { name: "Marcus Webb", avatarColor: "#f97316" },
    { name: "Priya Sharma", avatarColor: "#22c55e" },
    { name: "James Liu", avatarColor: "#06b6d4" },
    { name: "Emma Wright", avatarColor: "#eab308" },
  ];

  const players = await Promise.all(
    playerData.map((p) =>
      prisma.player.create({ data: { ...p, groupId: group.id } })
    )
  );

  const [alex, sarah, marcus, priya, james, emma] = players;

  // Create some singles matches
  const matchData = [
    { p1: alex, p2: sarah, sets: [[11, 8], [11, 9], [8, 11], [11, 6]] },
    { p1: marcus, p2: james, sets: [[11, 7], [11, 5], [11, 9]] },
    { p1: priya, p2: emma, sets: [[9, 11], [11, 8], [6, 11], [11, 9], [11, 7]] },
    { p1: alex, p2: marcus, sets: [[11, 9], [7, 11], [11, 8], [11, 10]] },
    { p1: sarah, p2: priya, sets: [[11, 6], [11, 8], [9, 11], [11, 9]] },
    { p1: james, p2: emma, sets: [[8, 11], [11, 9], [7, 11], [11, 8], [9, 11]] },
    { p1: alex, p2: priya, sets: [[11, 7], [11, 9], [11, 6]] },
    { p1: marcus, p2: sarah, sets: [[9, 11], [11, 9], [8, 11], [9, 11]] },
    { p1: emma, p2: alex, sets: [[11, 8], [9, 11], [11, 7], [11, 9]] },
    { p1: james, p2: priya, sets: [[11, 9], [11, 8], [8, 11], [11, 10]] },
  ];

  for (const m of matchData) {
    const match = await prisma.match.create({
      data: {
        groupId: group.id,
        type: "SINGLES",
        status: "COMPLETED",
        player1Id: m.p1.id,
        player2Id: m.p2.id,
        playedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.set.createMany({
      data: m.sets.map(([s1, s2], i) => ({
        matchId: match.id,
        setNumber: i + 1,
        score1: s1,
        score2: s2,
      })),
    });
  }

  // Create a league
  const league = await prisma.league.create({
    data: {
      groupId: group.id,
      name: "Summer League 2025",
      players: {
        create: players.map((p) => ({ playerId: p.id })),
      },
    },
  });

  // Generate round-robin fixtures
  const { generateRoundRobin } = await import("../src/lib/round-robin");
  const fixtures = generateRoundRobin(players.length);

  for (const [i, j] of fixtures) {
    await prisma.match.create({
      data: {
        groupId: group.id,
        type: "SINGLES",
        status: "PENDING",
        player1Id: players[i].id,
        player2Id: players[j].id,
        leagueId: league.id,
      },
    });
  }

  console.log("✅ Seed complete!");
  console.log(`   Group code: ${group.code}`);
  console.log(`   Players: ${players.map((p) => p.name).join(", ")}`);
  console.log(`   League: ${league.name}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
