import type { Outlet } from "./outlets";

export type ClaimStatus = "agreed" | "one-sided-left" | "one-sided-right" | "contested" | "partial";

export type SummarySentence = { text: string; sources: number[] };

export type Claim = {
  text: string;
  sources: number[];
  contradictedBy: number[];
  status: ClaimStatus;
};

export type LoadedTerm = {
  term: string;
  articleId: number;
  neutral: string;
  note: string;
};

export type ArticleView = {
  id: number;
  outlet: Outlet;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
};

export type EventCard = {
  id: number;
  title: string;
  topic: string | null;
  articleCount: number;
  outletCount: number;
  firstSeen: string;
  lastUpdated: string;
  coverage: { outletId: string; short: string; bias: number; reliability: number }[];
  agreedCount: number;
  leadHeadline: string | null;
};

export type EventDetail = EventCard & {
  summary: SummarySentence[];
  claims: Claim[];
  loadedTerms: LoadedTerm[];
  articles: ArticleView[];
  analyzedAt: string | null;
};

export type FeedMeta = {
  source: "live" | "sample";
  lastRun: string | null;
  outletCount: number;
  articleCount: number;
};
