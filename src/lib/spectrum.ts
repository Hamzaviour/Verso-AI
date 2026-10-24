// Shared encoding for the bias spectrum. Position carries the meaning;
// colour only reinforces it (cyan plate left, key centre, magenta plate right).

export function biasToPct(bias: number): number {
  return ((Math.max(-1, Math.min(1, bias)) + 1) / 2) * 100;
}

export function biasColor(bias: number): string {
  const t = Math.min(1, Math.abs(bias) / 0.7);
  const plate = bias < 0 ? "var(--cyan)" : "var(--magenta)";
  return `color-mix(in oklab, ${plate} ${Math.round(t * 100)}%, var(--key))`;
}

export function side(bias: number): "left" | "center" | "right" {
  if (bias <= -0.18) return "left";
  if (bias >= 0.18) return "right";
  return "center";
}

export function coverageSkew(biases: number[]): { label: string; side: "left" | "right" } | null {
  if (biases.length < 3) return null;
  const left = biases.filter((b) => b <= -0.18).length;
  const right = biases.filter((b) => b >= 0.18).length;
  if (left / biases.length >= 0.75 && right <= 1) return { label: "Mostly covered on the left", side: "left" };
  if (right / biases.length >= 0.75 && left <= 1) return { label: "Mostly covered on the right", side: "right" };
  return null;
}
