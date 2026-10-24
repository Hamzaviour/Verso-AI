import { getEvent, getEvents } from "./data";
import { side } from "./spectrum";
import type { ArticleView, EventDetail } from "./types";

export type QuizRound = {
  eventId: number;
  eventTitle: string;
  headline: string;
  outlet: { name: string; short: string; bias: number };
  others: { id: number; name: string; short: string; bias: number; headline: string }[];
  outletCount: number;
};

const WANT: ("left" | "right" | "center")[] = ["right", "left", "center", "left", "right", "center"];

function onePerOutlet(articles: ArticleView[]) {
  return [...new Map([...articles].reverse().map((a) => [a.outlet.id, a])).values()].sort((a, b) => a.outlet.bias - b.outlet.bias);
}

function pickRound(event: EventDetail, want: "left" | "right" | "center"): QuizRound | null {
  const pages = onePerOutlet(event.articles);
  if (pages.length < 3) return null;
  const matching = pages.filter((a) => side(a.outlet.bias) === want);
  const pool = matching.length ? matching : pages;
  // Most distinctive voice on that side: the outlet furthest from center.
  const chosen =
    want === "center"
      ? pool.reduce((b, a) => (Math.abs(a.outlet.bias) < Math.abs(b.outlet.bias) ? a : b))
      : pool.reduce((b, a) => (Math.abs(a.outlet.bias) > Math.abs(b.outlet.bias) ? a : b));
  return {
    eventId: event.id,
    eventTitle: event.title,
    headline: chosen.title,
    outlet: { name: chosen.outlet.name, short: chosen.outlet.short, bias: chosen.outlet.bias },
    others: pages
      .filter((a) => a.id !== chosen.id)
      .slice(0, 7)
      .map((a) => ({ id: a.id, name: a.outlet.name, short: a.outlet.short, bias: a.outlet.bias, headline: a.title })),
    outletCount: event.outletCount,
  };
}

export async function getLandingData() {
  const { events, meta } = await getEvents();
  const details = (await Promise.all(events.slice(0, 6).map((e) => getEvent(e.id)))).filter((e): e is EventDetail => e != null);
  const rounds = details.map((d, i) => pickRound(d, WANT[i % WANT.length])).filter((r): r is QuizRound => r != null);
  const lead = details[0] ?? null;
  const topicCount = new Set(events.map((e) => e.topic).filter(Boolean)).size;
  return { rounds, lead, meta, storyCount: events.length, topicCount };
}
