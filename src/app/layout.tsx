import type { Metadata, Viewport } from "next";
import { Archivo, Source_Serif_4 } from "next/font/google";
import { Masthead } from "@/components/masthead";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Verso — the other side of every story", template: "%s · Verso" },
  description:
    "Verso clusters coverage of each news event across the political spectrum, shows which facts every side agrees on, and where the wording differs.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e6e6e1" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0f11" },
  ],
};

// Design direction contract, emitted as an HTML comment so it survives the build.
const DIRECTION_CONTRACT = `<!--
THESIS: Coverage of one event shown as a wall of front pages arranged left to right, so the reader sees the shape of a story before any single take. Refuses the aggregator feed of identical cards with a bias pill.
OWN-WORLD: Newsprint grey sheets on a darker press-room ground; process-color CMYK as the only chroma: cyan = left plates, magenta = right plates, key ink = center, process yellow = highlighter for wording differences. Source Serif headline slabs, Archivo (variable width) for mastheads and data. Hairline rules, registration-mark details, misregistered-circle mark.
STORY: The reader sees today's events, opens one, watches outlets slide onto the spectrum, reads agreed facts first, compares headlines with differences highlighted, checks their own bubble.
FIRST VIEWPORT: Masthead with wordmark and edition line; lead event headline at display scale left, its coverage spectrum right; beneath, three front-page slabs (leftmost, center, rightmost headline) side by side. Primary action: open the story.
FORM: Front-page comparison wall, grounded candidate 3 of 7; seed 3b328450.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`;

// Applies a saved theme before first paint so there is no flash.
const themeScript = `try{var t=localStorage.getItem('verso-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${sourceSerif.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh flex flex-col">
        <div hidden dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-sheet focus:px-3 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>
        <Masthead />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
