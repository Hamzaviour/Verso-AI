// SAMPLE DATA. Shown only when no database or no analysed events exist yet.
// The event, the city and every outlet below are fictional, so no real
// publication is ever credited with words it did not print.

import type { Outlet } from "./outlets";
import type { ArticleView, EventDetail } from "./types";
import { classifyClaim } from "./claims";

const SAMPLE_OUTLETS: Outlet[] = [
  { id: "s-commons", name: "The Commons Dispatch", short: "CD", homepage: "#", feedUrl: "", bias: -0.78, reliability: 0.6 },
  { id: "s-ledger", name: "Harbor Ledger", short: "HL", homepage: "#", feedUrl: "", bias: -0.42, reliability: 0.8 },
  { id: "s-public", name: "Public Wire Radio", short: "PWR", homepage: "#", feedUrl: "", bias: -0.24, reliability: 0.85 },
  { id: "s-monitor", name: "Meridian Monitor", short: "MM", homepage: "#", feedUrl: "", bias: -0.02, reliability: 0.88 },
  { id: "s-tribune", name: "Northgate Tribune", short: "NT", homepage: "#", feedUrl: "", bias: 0.08, reliability: 0.76 },
  { id: "s-journal", name: "Capital Markets Journal", short: "CMJ", homepage: "#", feedUrl: "", bias: 0.3, reliability: 0.82 },
  { id: "s-standard", name: "The Standard-Herald", short: "SH", homepage: "#", feedUrl: "", bias: 0.56, reliability: 0.6 },
  { id: "s-patriot", name: "Patriot Daily", short: "PD", homepage: "#", feedUrl: "", bias: 0.82, reliability: 0.44 },
];

const o = (id: string) => SAMPLE_OUTLETS.find((x) => x.id === id)!;
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

function article(id: number, outletId: string, title: string, description: string, h: number): ArticleView {
  return { id, outlet: o(outletId), title, description, url: "#", publishedAt: hoursAgo(h) };
}

function finish(
  base: Omit<EventDetail, "claims" | "coverage" | "outletCount" | "articleCount" | "agreedCount" | "leadHeadline">,
  rawClaims: { text: string; sources: number[]; contradictedBy?: number[] }[],
): EventDetail {
  const byId = new Map(base.articles.map((a) => [a.id, a]));
  const outlets = new Set(base.articles.map((a) => a.outlet.id));
  const claims = rawClaims.map((c) => {
    const biases = [...new Map(c.sources.map((s) => [byId.get(s)!.outlet.id, byId.get(s)!.outlet.bias])).values()];
    return {
      text: c.text,
      sources: c.sources,
      contradictedBy: c.contradictedBy ?? [],
      status: classifyClaim(biases, c.contradictedBy?.length ?? 0, outlets.size),
    };
  });
  return {
    ...base,
    claims,
    articleCount: base.articles.length,
    outletCount: outlets.size,
    agreedCount: claims.filter((c) => c.status === "agreed").length,
    leadHeadline: base.articles[0]?.title ?? null,
    coverage: [...new Map(base.articles.map((a) => [a.outlet.id, a.outlet])).values()].map((x) => ({
      outletId: x.id,
      short: x.short,
      bias: x.bias,
      reliability: x.reliability,
    })),
  };
}

const transitArticles = [
  article(101, "s-commons", "Port Halden finally makes drivers pay for the pollution they cause", "Advocates hail a long-overdue congestion charge as a win for clean air and working families who rely on buses.", 2),
  article(102, "s-ledger", "Port Halden council approves $9 downtown congestion charge", "The 7-2 vote follows two years of debate; revenue is earmarked for bus service and street repairs.", 3),
  article(103, "s-public", "Port Halden votes to charge drivers entering downtown", "Council members approved a $9 weekday fee starting in March, with discounts for low-income residents.", 3),
  article(104, "s-monitor", "Port Halden adopts congestion pricing in 7-2 council vote", "The $9 weekday charge begins in March. Officials project $140 million a year for transit.", 4),
  article(105, "s-tribune", "Downtown driving fee passes; small businesses brace for impact", "Some merchants worry the charge will keep shoppers away, while transit riders welcome faster buses.", 4),
  article(106, "s-journal", "Port Halden's $9 toll tests whether pricing can fix gridlock", "Economists say charges can cut traffic, but the city's projections assume a sharp shift to transit.", 5),
  article(107, "s-standard", "Council slaps commuters with $9 daily toll", "Critics call the charge a tax grab that will hit suburban workers hardest.", 5),
  article(108, "s-patriot", "Radical council forces new driving tax on struggling families", "Opponents vow a ballot challenge to the 'war on cars' passed by city leaders.", 6),
];

const reservoirArticles = [
  article(201, "s-ledger", "Drought pushes Kessel Reservoir to its lowest level since 1977", "Water managers ask residents to cut outdoor use by a fifth as summer heat persists.", 7),
  article(202, "s-public", "Kessel Reservoir hits record-era low as region asks for water cuts", "Utilities propose a voluntary 20 percent reduction and warn mandatory limits could follow.", 8),
  article(203, "s-monitor", "Low reservoir levels prompt voluntary water restrictions", "Officials say levels are at 31 percent of capacity, the lowest in nearly five decades.", 8),
  article(204, "s-journal", "Water utilities weigh price hikes as Kessel levels fall", "Tiered pricing could follow voluntary cuts if levels keep falling through September.", 9),
  article(205, "s-standard", "Officials blame residents' lawns while ignoring decades of mismanagement", "Residents are being asked to sacrifice for planning failures, critics argue.", 9),
];

const chipsArticles = [
  article(301, "s-commons", "Chip plant subsidy hands $2 billion to a company that cut jobs last year", "Labor groups question the deal's job guarantees.", 11),
  article(302, "s-public", "Valemont wins chip factory backed by $2 billion in state incentives", "The plant is expected to employ 3,000 people when it opens in 2029.", 12),
  article(303, "s-tribune", "Chipmaker picks Valemont for new factory", "The governor called the deal the largest economic development project in state history.", 12),
  article(304, "s-journal", "Chipmaker's Valemont bet hinges on state incentives and water rights", "Analysts say the plant's timeline is ambitious.", 13),
  article(305, "s-patriot", "Governor's chip deal is another taxpayer-funded giveaway", "The incentives dwarf any previous package in the state.", 13),
];

export const SAMPLE_EVENTS: EventDetail[] = [
  finish(
    {
      id: -1,
      title: "Port Halden council approves $9 weekday congestion charge",
      topic: "Politics",
      firstSeen: hoursAgo(6),
      lastUpdated: hoursAgo(2),
      analyzedAt: hoursAgo(1),
      articles: transitArticles,
      summary: [
        { text: "Port Halden's city council voted 7-2 to charge drivers $9 to enter downtown on weekdays.", sources: [102, 103, 104] },
        { text: "The charge begins in March, with discounts for low-income residents.", sources: [103, 104] },
        { text: "Officials project about $140 million a year, earmarked for bus service and street repairs.", sources: [102, 104] },
        { text: "Some merchants and suburban commuters oppose the fee, and opponents have said they will seek a ballot challenge.", sources: [105, 107, 108] },
      ],
      loadedTerms: [
        { term: "slaps", articleId: 107, neutral: "charges", note: "Frames a policy decision as an aggressive act against commuters." },
        { term: "tax grab", articleId: 107, neutral: "fee", note: "Implies the motive is revenue extraction rather than traffic policy." },
        { term: "Radical", articleId: 108, neutral: "City", note: "Characterises the council ideologically instead of describing its action." },
        { term: "war on cars", articleId: 108, neutral: "driving fee", note: "Campaign slogan presented as description." },
        { term: "finally makes drivers pay", articleId: 101, neutral: "introduces a fee for drivers", note: "Presents the charge as overdue justice." },
        { term: "hail", articleId: 101, neutral: "support", note: "Celebratory verb that signals approval." },
      ],
    },
    [
      { text: "The council approved a $9 weekday charge to drive into downtown.", sources: [102, 103, 104, 106, 107] },
      { text: "The vote was 7-2.", sources: [102, 104] },
      { text: "The charge starts in March.", sources: [103, 104] },
      { text: "Revenue is earmarked for bus service and street repairs.", sources: [101, 102] },
      { text: "Low-income residents will receive discounts.", sources: [103] },
      { text: "Officials project around $140 million in annual revenue.", sources: [104, 106] },
      { text: "Some downtown merchants fear the fee will deter shoppers.", sources: [105, 107] },
      { text: "Opponents plan a ballot challenge.", sources: [108] },
      { text: "The charge will disproportionately burden suburban workers.", sources: [107, 108], contradictedBy: [103] },
    ],
  ),
  finish(
    {
      id: -2,
      title: "Kessel Reservoir falls to lowest level since 1977; utilities ask for 20% cuts",
      topic: "Climate",
      firstSeen: hoursAgo(10),
      lastUpdated: hoursAgo(7),
      analyzedAt: hoursAgo(6),
      articles: reservoirArticles,
      summary: [
        { text: "Kessel Reservoir is at about 31 percent of capacity, its lowest level since 1977.", sources: [201, 203] },
        { text: "Regional utilities have asked residents to voluntarily reduce water use by 20 percent.", sources: [201, 202, 203] },
        { text: "Mandatory limits or tiered pricing could follow if levels keep falling.", sources: [202, 204] },
      ],
      loadedTerms: [
        { term: "blame", articleId: 205, neutral: "ask", note: "Recasts a conservation request as an accusation." },
        { term: "mismanagement", articleId: 205, neutral: "water planning", note: "Asserts fault without cited evidence." },
      ],
    },
    [
      { text: "The reservoir is at its lowest level since 1977.", sources: [201, 202, 203] },
      { text: "Utilities asked for a voluntary 20 percent cut in water use.", sources: [201, 202, 203, 205] },
      { text: "Mandatory restrictions could follow.", sources: [202] },
      { text: "Utilities are considering tiered water pricing.", sources: [204] },
      { text: "Past planning decisions contributed to the shortage.", sources: [205] },
    ],
  ),
  finish(
    {
      id: -3,
      title: "Chipmaker chooses Valemont for factory backed by $2 billion in state incentives",
      topic: "Business",
      firstSeen: hoursAgo(14),
      lastUpdated: hoursAgo(11),
      analyzedAt: hoursAgo(10),
      articles: chipsArticles,
      summary: [
        { text: "A chipmaker selected Valemont for a new factory supported by about $2 billion in state incentives.", sources: [301, 302, 303] },
        { text: "The plant is expected to employ about 3,000 people when it opens in 2029.", sources: [302] },
        { text: "Critics on both labor and fiscal grounds question the size of the package.", sources: [301, 305] },
      ],
      loadedTerms: [
        { term: "hands", articleId: 301, neutral: "provides", note: "Suggests the money is given away rather than contracted." },
        { term: "giveaway", articleId: 305, neutral: "incentive package", note: "Frames incentives as a gift without conditions." },
      ],
    },
    [
      { text: "The state is offering about $2 billion in incentives.", sources: [301, 302, 304, 305] },
      { text: "The factory will be built in Valemont.", sources: [302, 303, 304] },
      { text: "The plant is expected to employ 3,000 people.", sources: [302] },
      { text: "The company cut jobs last year.", sources: [301] },
      { text: "It is the largest incentive package in state history.", sources: [303, 305] },
    ],
  ),
];
