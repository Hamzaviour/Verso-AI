"use client";

import { useEffect } from "react";
import { recordRead } from "@/lib/bubble";

export function RecordStoryView({ id, biases }: { id: string; biases: number[] }) {
  useEffect(() => {
    const mean = biases.length ? biases.reduce((s, b) => s + b, 0) / biases.length : 0;
    recordRead({ kind: "story", id, bias: mean });
  }, [id, biases]);
  return null;
}
