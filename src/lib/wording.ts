// Word-level comparison of headlines. A word is "distinctive" when this
// headline uses it but most other headlines about the same event do not.

const STOP = new Set(
  "a an the and or but of to in on at for from by with as is are was were be been being it its this that these those after before over under into about than then so if not no yes new says say said will would can could may might has have had do does did his her their our your my we they he she you i us them him who what when where why how amid via up out off more most".split(
    " ",
  ),
);

export function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[‘’']/g, "'")
    .split(/[^a-z0-9$%'-]+/)
    .map((w) => w.replace(/^'+|'+$/g, "").replace(/'s$/, ""))
    .filter((w) => w.length > 1 && !STOP.has(w));
}

function stem(w: string) {
  return w.replace(/(ing|ed|es|s)$/, "");
}

export type Segment = { text: string; distinctive: boolean; loaded?: { neutral: string; note: string } };

export function distinctiveWords(headlines: string[]): Set<string>[] {
  const sets = headlines.map((h) => new Set(tokens(h).map(stem)));
  return sets.map((set, i) => {
    const others = sets.filter((_, j) => j !== i);
    const out = new Set<string>();
    for (const w of set) {
      const share = others.length ? others.filter((o) => o.has(w)).length / others.length : 0;
      if (share < 0.25) out.add(w);
    }
    return out;
  });
}

export function sharedWords(headlines: string[], min = 0.5): string[] {
  const counts = new Map<string, { n: number; display: string }>();
  for (const h of headlines) {
    const seen = new Set<string>();
    for (const w of tokens(h)) {
      const s = stem(w);
      if (seen.has(s)) continue;
      seen.add(s);
      const c = counts.get(s);
      counts.set(s, { n: (c?.n ?? 0) + 1, display: c?.display ?? w });
    }
  }
  return [...counts.values()]
    .filter((c) => c.n / headlines.length >= min)
    .sort((a, b) => b.n - a.n)
    .slice(0, 8)
    .map((c) => c.display);
}

// Split a headline into segments, flagging distinctive words and loaded terms.
export function segment(
  text: string,
  distinctive: Set<string>,
  loaded: { term: string; neutral: string; note: string }[],
): Segment[] {
  const ranges: { start: number; end: number; neutral: string; note: string }[] = [];
  const lower = text.toLowerCase();
  for (const l of loaded) {
    const idx = lower.indexOf(l.term.toLowerCase());
    if (idx >= 0) ranges.push({ start: idx, end: idx + l.term.length, neutral: l.neutral, note: l.note });
  }
  ranges.sort((a, b) => a.start - b.start);

  const out: Segment[] = [];
  let i = 0;
  const pushWords = (chunk: string) => {
    for (const part of chunk.split(/(\s+)/)) {
      if (!part) continue;
      const core = part.toLowerCase().replace(/[^a-z0-9$%'-]/g, "").replace(/'s$/, "");
      const isDist = core.length > 1 && !STOP.has(core) && distinctive.has(stem(core));
      const last = out[out.length - 1];
      if (last && !last.loaded && last.distinctive === isDist) last.text += part;
      else if (last && !last.loaded && /^\s+$/.test(part)) last.text += part;
      else out.push({ text: part, distinctive: isDist });
    }
  };
  for (const r of ranges) {
    if (r.start < i) continue;
    pushWords(text.slice(i, r.start));
    out.push({ text: text.slice(r.start, r.end), distinctive: false, loaded: { neutral: r.neutral, note: r.note } });
    i = r.end;
  }
  pushWords(text.slice(i));
  return out;
}
