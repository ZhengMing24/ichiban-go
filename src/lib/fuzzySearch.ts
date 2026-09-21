export function fuzzyMatch(target: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const t = target.toLowerCase();
  if (t.includes(q)) return true;

  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}
