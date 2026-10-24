import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyClaim } from "./claims";
import { clusterPoints, normalize } from "./cluster-core";
import { distinctiveWords, sharedWords } from "./wording";

test("claims reported on both sides are agreed", () => {
  assert.equal(classifyClaim([-0.6, 0.5], 0, 8), "agreed");
});

test("claims reported only on one side are one-sided", () => {
  assert.equal(classifyClaim([-0.6, -0.3], 0, 8), "one-sided-left");
  assert.equal(classifyClaim([0.7], 0, 8), "one-sided-right");
});

test("any contradiction makes a claim contested", () => {
  assert.equal(classifyClaim([-0.6, 0.5], 1, 8), "contested");
});

test("center-only claims from a few outlets are partial", () => {
  assert.equal(classifyClaim([0.0, 0.1], 0, 8), "partial");
});

test("clustering groups near-identical vectors and separates distant ones", () => {
  const v = (xs: number[]) => normalize(xs);
  const groups = clusterPoints([
    { id: 1, outletId: "a", vec: v([1, 0.05, 0]) },
    { id: 2, outletId: "b", vec: v([1, 0, 0.05]) },
    { id: 3, outletId: "c", vec: v([0, 1, 0]) },
    { id: 4, outletId: "d", vec: v([0.02, 1, 0]) },
  ]);
  const sets = groups.map((g) => g.map((p) => p.id).sort().join(",")).sort();
  assert.deepEqual(sets, ["1,2", "3,4"]);
});

test("distinctive words exclude vocabulary most headlines share", () => {
  const heads = [
    "Council approves congestion charge",
    "Council approves downtown congestion charge",
    "Radical council forces congestion charge on families",
  ];
  const d = distinctiveWords(heads);
  assert.ok(d[2].has("radical"));
  assert.ok(!d[2].has("council"));
  assert.ok(sharedWords(heads).includes("council"));
});
