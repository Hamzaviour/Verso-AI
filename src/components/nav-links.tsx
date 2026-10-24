"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Today" },
  { href: "/bubble", label: "Your bubble" },
  { href: "/method", label: "Method" },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="ml-2 hidden items-center gap-1 md:flex">
      {LINKS.map((l) => {
        const active = l.href === "/" ? pathname === "/" || pathname.startsWith("/story") : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`relative rounded-sm px-3 py-1.5 text-[14px] font-medium transition-colors ${
              active ? "text-ink" : "text-ink-3 hover:text-ink"
            }`}
          >
            {l.label}
            {active && <span className="absolute inset-x-3 -bottom-[13px] h-[2px] bg-ink" aria-hidden />}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-rule bg-paper/95 backdrop-blur md:hidden"
    >
      {LINKS.map((l) => {
        const active = l.href === "/" ? pathname === "/" || pathname.startsWith("/story") : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`flex-1 py-3 text-center text-[13px] font-semibold ${active ? "text-ink" : "text-ink-3"}`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
