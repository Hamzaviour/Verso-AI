// Curated outlet table. Bias (-1 left .. +1 right) and reliability (0..1) are
// Verso editorial estimates informed by public media-bias ratings
// (AllSides, Ad Fontes Media, Media Bias/Fact Check). They are judgements,
// shown in the UI as such, and are meant to be argued with.

export type Outlet = {
  id: string;
  name: string;
  short: string;
  homepage: string;
  feedUrl: string;
  bias: number;
  reliability: number;
};

export const OUTLETS: Outlet[] = [
  // Left
  { id: "democracy-now", name: "Democracy Now!", short: "DN", homepage: "https://www.democracynow.org", feedUrl: "https://www.democracynow.org/democracynow.rss", bias: -0.82, reliability: 0.62 },
  { id: "mother-jones", name: "Mother Jones", short: "MJ", homepage: "https://www.motherjones.com", feedUrl: "https://www.motherjones.com/feed/", bias: -0.74, reliability: 0.64 },
  { id: "the-nation", name: "The Nation", short: "NAT", homepage: "https://www.thenation.com", feedUrl: "https://www.thenation.com/feed/?post_type=article", bias: -0.78, reliability: 0.6 },
  { id: "huffpost", name: "HuffPost", short: "HP", homepage: "https://www.huffpost.com", feedUrl: "https://www.huffpost.com/section/front-page/feed", bias: -0.66, reliability: 0.6 },
  { id: "the-intercept", name: "The Intercept", short: "TI", homepage: "https://theintercept.com", feedUrl: "https://theintercept.com/feed/?rss", bias: -0.7, reliability: 0.63 },
  { id: "vox", name: "Vox", short: "VOX", homepage: "https://www.vox.com", feedUrl: "https://www.vox.com/rss/index.xml", bias: -0.6, reliability: 0.68 },
  { id: "slate", name: "Slate", short: "SL", homepage: "https://slate.com", feedUrl: "https://slate.com/feeds/all.rss", bias: -0.62, reliability: 0.62 },
  // Lean left
  { id: "guardian", name: "The Guardian", short: "GU", homepage: "https://www.theguardian.com", feedUrl: "https://www.theguardian.com/world/rss", bias: -0.45, reliability: 0.78 },
  { id: "nyt", name: "The New York Times", short: "NYT", homepage: "https://www.nytimes.com", feedUrl: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml", bias: -0.36, reliability: 0.82 },
  { id: "washington-post", name: "The Washington Post", short: "WP", homepage: "https://www.washingtonpost.com", feedUrl: "https://feeds.washingtonpost.com/rss/national", bias: -0.36, reliability: 0.8 },
  { id: "npr", name: "NPR", short: "NPR", homepage: "https://www.npr.org", feedUrl: "https://feeds.npr.org/1001/rss.xml", bias: -0.3, reliability: 0.84 },
  { id: "the-atlantic", name: "The Atlantic", short: "ATL", homepage: "https://www.theatlantic.com", feedUrl: "https://www.theatlantic.com/feed/all/", bias: -0.42, reliability: 0.74 },
  { id: "cbs", name: "CBS News", short: "CBS", homepage: "https://www.cbsnews.com", feedUrl: "https://www.cbsnews.com/latest/rss/main", bias: -0.26, reliability: 0.8 },
  { id: "abc", name: "ABC News", short: "ABC", homepage: "https://abcnews.go.com", feedUrl: "https://abcnews.go.com/abcnews/topstories", bias: -0.26, reliability: 0.8 },
  { id: "politico", name: "Politico", short: "POL", homepage: "https://www.politico.com", feedUrl: "https://rss.politico.com/politics-news.xml", bias: -0.2, reliability: 0.8 },
  // Center
  { id: "bbc", name: "BBC News", short: "BBC", homepage: "https://www.bbc.com/news", feedUrl: "https://feeds.bbci.co.uk/news/world/rss.xml", bias: -0.1, reliability: 0.87 },
  { id: "csm", name: "Christian Science Monitor", short: "CSM", homepage: "https://www.csmonitor.com", feedUrl: "https://rss.csmonitor.com/feeds/all", bias: -0.04, reliability: 0.86 },
  { id: "the-hill", name: "The Hill", short: "HIL", homepage: "https://thehill.com", feedUrl: "https://thehill.com/feed/", bias: 0.0, reliability: 0.76 },
  { id: "dw", name: "Deutsche Welle", short: "DW", homepage: "https://www.dw.com", feedUrl: "https://rss.dw.com/rdf/rss-en-all", bias: -0.06, reliability: 0.84 },
  { id: "france24", name: "France 24", short: "F24", homepage: "https://www.france24.com/en", feedUrl: "https://www.france24.com/en/rss", bias: -0.08, reliability: 0.82 },
  { id: "al-jazeera", name: "Al Jazeera English", short: "AJE", homepage: "https://www.aljazeera.com", feedUrl: "https://www.aljazeera.com/xml/rss/all.xml", bias: -0.22, reliability: 0.72 },
  { id: "newsweek", name: "Newsweek", short: "NW", homepage: "https://www.newsweek.com", feedUrl: "https://www.newsweek.com/rss", bias: 0.04, reliability: 0.68 },
  // Lean right
  { id: "wsj", name: "The Wall Street Journal", short: "WSJ", homepage: "https://www.wsj.com", feedUrl: "https://feeds.a.dj.com/rss/RSSWorldNews.xml", bias: 0.22, reliability: 0.84 },
  { id: "reason", name: "Reason", short: "RSN", homepage: "https://reason.com", feedUrl: "https://reason.com/feed/", bias: 0.38, reliability: 0.7 },
  { id: "the-dispatch", name: "The Dispatch", short: "DSP", homepage: "https://thedispatch.com", feedUrl: "https://thedispatch.com/feed/", bias: 0.4, reliability: 0.74 },
  { id: "washington-examiner", name: "Washington Examiner", short: "WE", homepage: "https://www.washingtonexaminer.com", feedUrl: "https://www.washingtonexaminer.com/feed", bias: 0.56, reliability: 0.6 },
  { id: "ny-post", name: "New York Post", short: "NYP", homepage: "https://nypost.com", feedUrl: "https://nypost.com/feed/", bias: 0.5, reliability: 0.56 },
  { id: "washington-times", name: "The Washington Times", short: "WT", homepage: "https://www.washingtontimes.com", feedUrl: "https://www.washingtontimes.com/rss/headlines/news/", bias: 0.58, reliability: 0.6 },
  // Right
  { id: "fox-news", name: "Fox News", short: "FOX", homepage: "https://www.foxnews.com", feedUrl: "https://moxie.foxnews.com/google-publisher/latest.xml", bias: 0.66, reliability: 0.56 },
  { id: "national-review", name: "National Review", short: "NR", homepage: "https://www.nationalreview.com", feedUrl: "https://www.nationalreview.com/feed/", bias: 0.68, reliability: 0.64 },
  { id: "daily-caller", name: "The Daily Caller", short: "DC", homepage: "https://dailycaller.com", feedUrl: "https://dailycaller.com/feed/", bias: 0.76, reliability: 0.5 },
  { id: "the-federalist", name: "The Federalist", short: "FED", homepage: "https://thefederalist.com", feedUrl: "https://thefederalist.com/feed/", bias: 0.8, reliability: 0.46 },
  { id: "breitbart", name: "Breitbart", short: "BB", homepage: "https://www.breitbart.com", feedUrl: "https://feeds.feedburner.com/breitbart", bias: 0.86, reliability: 0.4 },
];

export function biasLabel(bias: number): string {
  if (bias <= -0.55) return "Left";
  if (bias <= -0.18) return "Lean left";
  if (bias < 0.18) return "Center";
  if (bias < 0.55) return "Lean right";
  return "Right";
}

export function reliabilityLabel(r: number): string {
  if (r >= 0.8) return "High";
  if (r >= 0.65) return "Mostly reliable";
  if (r >= 0.5) return "Mixed";
  return "Low";
}
