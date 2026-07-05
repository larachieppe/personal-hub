import Link from "next/link";
import Crest from "./Crest";
import MobileNav from "./MobileNav";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/plan", label: "Plan" },
  { href: "/curriculum", label: "Curriculum" },
  { href: "/habits", label: "Habits" },
  { href: "/meals", label: "Meals" },
  { href: "/pantry", label: "Pantry" },
  { href: "/review", label: "Review" },
  { href: "/resources", label: "Athenaeum" },
];

export default function Nav() {
  return (
    <header className="relative border-b border-border">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5 text-gold">
          <Crest className="h-6 w-6 shrink-0" />
          <span className="font-display text-lg italic tracking-wide text-foreground whitespace-nowrap">
            Polymath Hub
          </span>
        </Link>
        <div className="hidden lg:flex gap-5 text-xs font-medium uppercase tracking-[0.12em] text-muted">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="border-b border-transparent pb-1 transition-colors hover:border-gold hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <MobileNav links={LINKS} />
      </nav>
    </header>
  );
}
