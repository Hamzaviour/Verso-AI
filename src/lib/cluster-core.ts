// Event clustering over article embeddings.
//
// Two passes, both on cosine similarity of L2-normalised vectors:
//  1. Leader pass: walk articles oldest-first; each joins the most similar
//     cluster centroid above `join`, otherwise it starts a new cluster.
//  2. Merge pass: clusters whose centroids are above `merge` are unioned,
//     which repairs stories that split because their first articles differed.
// Linear in articles x clusters, fine for a 48h window of a few thousand items.

export type Point = { id: number; outletId: string; vec: Float32Array };

export type ClusterOptions = { join: number; merge: number };

export const DEFAULT_CLUSTER_OPTIONS: ClusterOptions = { join: 0.6, merge: 0.74 };

export function normalize(v: ArrayLike<number>): Float32Array {
  let n = 0;
  for (let i = 0; i < v.length; i++) n += v[i] * v[i];
  n = Math.sqrt(n) || 1;
  const out = new Float32Array(v.length);
  for (let i = 0; i < v.length; i++) out[i] = v[i] / n;
  return out;
}

export function dot(a: Float32Array, b: Float32Array): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

type Cluster = { sum: Float32Array; centroid: Float32Array; members: number[] };

function addTo(c: Cluster, v: Float32Array) {
  for (let i = 0; i < v.length; i++) c.sum[i] += v[i];
  c.centroid = normalize(c.sum);
}

export function clusterPoints(points: Point[], opts: ClusterOptions = DEFAULT_CLUSTER_OPTIONS): Point[][] {
  const clusters: Cluster[] = [];

  points.forEach((p, idx) => {
    let best = -1;
    let bestSim = opts.join;
    for (let c = 0; c < clusters.length; c++) {
      const s = dot(p.vec, clusters[c].centroid);
      if (s >= bestSim) {
        bestSim = s;
        best = c;
      }
    }
    if (best === -1) {
      clusters.push({ sum: Float32Array.from(p.vec), centroid: p.vec, members: [idx] });
    } else {
      clusters[best].members.push(idx);
      addTo(clusters[best], p.vec);
    }
  });

  // Union-find over centroid pairs.
  const parent = clusters.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  for (let a = 0; a < clusters.length; a++) {
    for (let b = a + 1; b < clusters.length; b++) {
      if (dot(clusters[a].centroid, clusters[b].centroid) >= opts.merge) {
        parent[find(b)] = find(a);
      }
    }
  }

  const groups = new Map<number, Point[]>();
  clusters.forEach((c, i) => {
    const root = find(i);
    const list = groups.get(root) ?? [];
    for (const m of c.members) list.push(points[m]);
    groups.set(root, list);
  });
  return [...groups.values()];
}

export function outletCount(group: Point[]): number {
  return new Set(group.map((p) => p.outletId)).size;
}
