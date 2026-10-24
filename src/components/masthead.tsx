import Link from "next/link";
import { Suspense } from "react";
import { Wordmark } from "@/components/brand/logo";
import { NavLinks } from "@/components/nav-links";
import { ThemeToggle } from "@/components/theme-toggle";
import { BubbleChip } from "@/components/bubble/bubble-chip";
import { EditionDate } from "@/components/time";

export function Masthead() {
  return (
    <header className="relative border-b border-rule bg-paper">
      <div className="mx-auto flex max-w-[1320px] items-center gap-4 px-4 pt-4 pb-3 sm:px-6 lg:px-10">
        <Link href="/" aria-label="Verso home" className="shrink-0 rounded-sm">
          <Wordmark size={30} />
        </Link>
        <Suspense fallback={<div className="ml-2 hidden md:block" />}>
          <NavLinks />
        </Suspense>
        <div className="ml-auto flex items-center gap-2">
          <BubbleChip />
          <ThemeToggle />
        </div>
      </div>
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 border-t border-rule px-4 py-1.5 text-[12px] text-ink-3 sm:px-6 lg:px-10">
        <EditionDate />
        <span className="hidden font-serif italic sm:inline">The other side of every story.</span>
      </div>
      <div className="reg-rule h-[3px] w-full" aria-hidden />
    </header>
  );
}
