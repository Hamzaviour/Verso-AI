import Link from "next/link";
import { Suspense } from "react";
import { Mark } from "@/components/brand/logo";
import { MobileNav } from "@/components/nav-links";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-rule pb-20 md:pb-0">
      <div className="mx-auto grid max-w-[1320px] gap-8 px-4 py-10 text-[13px] text-ink-3 sm:px-6 md:grid-cols-[1fr_auto] lg:px-10">
        <div className="flex max-w-xl items-start gap-3">
          <Mark size={18} className="mt-0.5 shrink-0" />
          <p className="leading-relaxed">
            Verso reads public RSS feeds, groups articles about the same event, and asks a language model to separate what
            every side reports from what only one side does. Outlet positions are editorial estimates.{" "}
            <Link href="/method" className="text-ink-2 underline decoration-rule underline-offset-4 hover:decoration-ink">
              Read the method
            </Link>
            .
          </p>
        </div>
        <nav aria-label="Footer" className="flex gap-5">
          <Link href="/method" className="hover:text-ink">Method</Link>
          <Link href="/brand" className="hover:text-ink">Brand</Link>
          <Link href="/bubble" className="hover:text-ink">Your bubble</Link>
        </nav>
      </div>
      <Suspense fallback={null}>
        <MobileNav />
      </Suspense>
    </footer>
  );
}
