/**
 * Generate all fixtures for a round-robin tournament.
 * Returns an array of [playerIndex1, playerIndex2] pairs.
 */
export function generateRoundRobin(n: number): [number, number][] {
  const fixtures: [number, number][] = [];
  const players = Array.from({ length: n }, (_, i) => i);

  // If odd number, add a bye
  const list = n % 2 === 0 ? [...players] : [...players, -1];
  const numRounds = list.length - 1;
  const half = list.length / 2;

  for (let round = 0; round < numRounds; round++) {
    for (let i = 0; i < half; i++) {
      const p1 = list[i];
      const p2 = list[list.length - 1 - i];
      if (p1 !== -1 && p2 !== -1) {
        fixtures.push([p1, p2]);
      }
    }
    // Rotate: keep list[0] fixed, rotate the rest
    const last = list[list.length - 1];
    for (let i = list.length - 1; i > 1; i--) {
      list[i] = list[i - 1];
    }
    list[1] = last;
  }

  return fixtures;
}
