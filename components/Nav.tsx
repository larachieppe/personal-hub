"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Crest from "./Crest";
import MobileNav from "./MobileNav";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/plan", label: "Plan" },
  { href: "/todos", label: "To-Do" },
  { href: "/curriculum", label: "Curriculum" },
  { href: "/progress", label: "Progress" },
  { href: "/kitchen", label: "Kitchen" },
  { href: "/resources", label: "Athenaeum" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-2.5 text-gold">
          <Crest className="h-6 w-6 shrink-0 transition-transform duration-300 group-hover:rotate-12" />
          <span className="font-display text-lg italic tracking-wide text-foreground whitespace-nowrap">
            Polymath Hub
          </span>
        </Link>
        <div className="hidden lg:flex gap-6 text-xs font-medium uppercase tracking-[0.12em] text-muted">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active
                    ? "border-b border-gold pb-1 text-gold transition-colors"
                    : "border-b border-transparent pb-1 transition-colors hover:border-gold-dim hover:text-foreground"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <MobileNav links={LINKS} />
      </nav>
    </header>
  );
}
