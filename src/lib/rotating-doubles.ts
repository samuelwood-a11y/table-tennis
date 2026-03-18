/**
 * Rotating Doubles fixture generator.
 * Players earn individual standings but play as doubles pairs.
 * One player sits out per match and acts as referee.
 *
 * For 5 players, generates a balanced base cycle of 5 matches where:
 * - Every player refs exactly once per cycle
 * - Every pair of players partners exactly once per cycle
 * - No player sits out in consecutive matches
 *
 * Repeat the cycle N times for longer competitions (default 3x = 15 matches).
 */

export type RotatingFixture = {
  fixtureNumber: number;
  cycleNumber: number;
  refereeIndex: number;
  team1: [number, number];
  team2: [number, number];
};

/** Base 5-player cycle — mathematically balanced, no consecutive sit-outs */
const BASE_5_CYCLE: Array<{ ref: number; t1: [number, number]; t2: [number, number] }> = [
  { ref: 4, t1: [0, 1], t2: [2, 3] },
  { ref: 3, t1: [0, 2], t2: [1, 4] },
  { ref: 1, t1: [0, 3], t2: [2, 4] },
  { ref: 2, t1: [0, 4], t2: [1, 3] },
  { ref: 0, t1: [1, 2], t2: [3, 4] },
];

/**
 * Generate fixtures for n players using round-robin with sit-out.
 * For n=5 uses the pre-computed balanced cycle.
 * For other odd n, uses a general algorithm.
 */
export function generateRotatingDoublesCycle(
  n: number
): Array<{ ref: number; t1: [number, number]; t2: [number, number] }> {
  if (n === 5) return BASE_5_CYCLE;
  if (n % 2 === 0) throw new Error("Rotating doubles requires an odd number of players");
  if (n < 3) throw new Error("Need at least 3 players");

  // General algorithm for odd n: each round, one player sits out
  // Remaining n-1 players (even) are split into two teams of (n-1)/2
  // For standard doubles (2v2), n must be 5
  // For other sizes, we use round-robin scheduling
  return generateGeneralCycle(n);
}

function generateGeneralCycle(
  n: number
): Array<{ ref: number; t1: [number, number]; t2: [number, number] }> {
  const fixtures: Array<{ ref: number; t1: [number, number]; t2: [number, number] }> = [];
  // Use a rotating schedule: player i refs match i
  // Remaining players are paired using round-robin
  for (let i = 0; i < n; i++) {
    const playing = Array.from({ length: n }, (_, j) => j).filter((j) => j !== i);
    // Simple split: first half vs second half
    const half = Math.floor(playing.length / 2);
    const t1: [number, number] = [playing[0], playing[1]];
    const t2: [number, number] = [playing[2], playing[3]];
    fixtures.push({ ref: i, t1, t2 });
  }
  return fixtures;
}

/**
 * Generate all fixtures for a rotating doubles competition.
 * @param playerIds - Array of player IDs (must be odd, ideally 5)
 * @param cycles - How many times to repeat the base cycle (default 3)
 */
export function generateRotatingDoublesFixtures(
  playerIds: string[],
  cycles = 3
): Array<{
  fixtureNumber: number;
  cycleNumber: number;
  refereeId: string;
  team1PlayerIds: [string, string];
  team2PlayerIds: [string, string];
}> {
  const n = playerIds.length;
  const baseCycle = generateRotatingDoublesCycle(n);
  const fixtures = [];
  let fixtureNumber = 1;

  for (let cycle = 1; cycle <= cycles; cycle++) {
    for (const f of baseCycle) {
      fixtures.push({
        fixtureNumber: fixtureNumber++,
        cycleNumber: cycle,
        refereeId: playerIds[f.ref],
        team1PlayerIds: [playerIds[f.t1[0]], playerIds[f.t1[1]]] as [string, string],
        team2PlayerIds: [playerIds[f.t2[0]], playerIds[f.t2[1]]] as [string, string],
      });
    }
  }

  return fixtures;
}

/** Validate a rotating doubles schedule for fairness */
export function validateSchedule(
  playerIds: string[],
  fixtures: ReturnType<typeof generateRotatingDoublesFixtures>
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  const n = playerIds.length;

  // Check no consecutive sit-outs
  for (let i = 1; i < fixtures.length; i++) {
    if (fixtures[i].refereeId === fixtures[i - 1].refereeId) {
      issues.push(`Player ${fixtures[i].refereeId} sits out consecutively in fixtures ${i} and ${i + 1}`);
    }
  }

  // Check sit-out distribution
  const refCounts: Record<string, number> = {};
  for (const id of playerIds) refCounts[id] = 0;
  for (const f of fixtures) refCounts[f.refereeId]++;
  const counts = Object.values(refCounts);
  const minRefs = Math.min(...counts);
  const maxRefs = Math.max(...counts);
  if (maxRefs - minRefs > 1) {
    issues.push(`Uneven referee distribution: min ${minRefs}, max ${maxRefs}`);
  }

  return { valid: issues.length === 0, issues };
}

/** Compute fairness summary for display */
export function computeFairnessSummary(
  playerIds: string[],
  playerNames: Record<string, string>,
  fixtures: ReturnType<typeof generateRotatingDoublesFixtures>
) {
  const summary: Record<
    string,
    { name: string; played: number; refs: number; partners: Record<string, number>; opponents: Record<string, number> }
  > = {};

  for (const id of playerIds) {
    summary[id] = { name: playerNames[id] ?? id, played: 0, refs: 0, partners: {}, opponents: {} };
  }

  for (const f of fixtures) {
    summary[f.refereeId].refs++;
    const [t1a, t1b] = f.team1PlayerIds;
    const [t2a, t2b] = f.team2PlayerIds;

    for (const id of [t1a, t1b, t2a, t2b]) summary[id].played++;

    // Partners
    summary[t1a].partners[t1b] = (summary[t1a].partners[t1b] ?? 0) + 1;
    summary[t1b].partners[t1a] = (summary[t1b].partners[t1a] ?? 0) + 1;
    summary[t2a].partners[t2b] = (summary[t2a].partners[t2b] ?? 0) + 1;
    summary[t2b].partners[t2a] = (summary[t2b].partners[t2a] ?? 0) + 1;

    // Opponents
    for (const id of [t1a, t1b]) {
      for (const opp of [t2a, t2b]) {
        summary[id].opponents[opp] = (summary[id].opponents[opp] ?? 0) + 1;
        summary[opp].opponents[id] = (summary[opp].opponents[id] ?? 0) + 1;
      }
    }
  }

  return summary;
}
