// Tiny sampling helpers shared by the three question banks, so each attempt
// draws a fresh, balanced subset instead of the same fixed list every time.

/** Fisher–Yates: return `n` random items from `arr` (or all, shuffled, if n ≥ length). */
function pick<T>(arr: T[], n: number): T[] {
  const a = [...arr];
  const k = Math.min(n, a.length);
  for (let i = 0; i < k; i++) {
    const j = i + Math.floor(Math.random() * (a.length - i));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, k);
}

/** Group items by a key, pick `perGroup` from each group, then shuffle the lot. */
export function sampleByGroup<T, K extends string>(
  items: T[],
  keyOf: (t: T) => K,
  perGroup: number,
): T[] {
  const groups = new Map<K, T[]>();
  for (const it of items) {
    const k = keyOf(it);
    (groups.get(k) ?? groups.set(k, []).get(k)!).push(it);
  }
  const out: T[] = [];
  for (const g of groups.values()) out.push(...pick(g, perGroup));
  return pick(out, out.length); // shuffle the combined set
}
