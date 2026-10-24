"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type Ctx = {
  active: string | null;
  setActive: (outletId: string | null) => void;
};

const StoryCtx = createContext<Ctx>({ active: null, setActive: () => {} });

export function StoryProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<string | null>(null);
  const value = useMemo(() => ({ active, setActive }), [active]);
  return <StoryCtx.Provider value={value}>{children}</StoryCtx.Provider>;
}

export function useStory() {
  return useContext(StoryCtx);
}
