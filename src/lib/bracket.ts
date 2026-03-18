/**
 * Generate a single-elimination bracket.
 * Returns rounds where each round is an array of [seed1, seed2|null] pairs.
 * null = bye (auto-advance).
 */
export function generateBracket(playerCount: number): [number, number | null][][] {
  // Next power of 2
  let size = 1;
  while (size < playerCount) size *= 2;

  const byes = size - playerCount;
  const seeds = Array.from({ length: playerCount }, (_, i) => i);

  // First round: pair seeds with byes
  const round1: [number, number | null][] = [];
  for (let i = 0; i < size / 2; i++) {
    const s1 = seeds[i] ?? null;
    const s2 = seeds[size - 1 - i] ?? null;
    if (s1 !== null && s2 !== null) {
      round1.push([s1, s2]);
    } else {
      round1.push([s1 ?? s2 ?? 0, null]);
    }
  }

  return [round1];
}

export function getTotalRounds(playerCount: number): number {
  return Math.ceil(Math.log2(playerCount));
}

export function getBracketPositionParent(position: number): number {
  return Math.ceil(position / 2);
}
