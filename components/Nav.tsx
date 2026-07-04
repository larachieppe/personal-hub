import Link from "next/link";
import Crest from "./Crest";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/curriculum", label: "Curriculum" },
  { href: "/resources", label: "Athenaeum" },
];

export default function Nav() {
  return (
    <header className="border-b border-border">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5 text-gold">
          <Crest className="h-6 w-6" />
          <span className="font-display text-lg italic tracking-wide text-foreground">
            Polymath Hub
          </span>
        </Link>
        <div className="flex gap-6 text-xs font-medium uppercase tracking-[0.15em] text-muted">
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
      </nav>
    </header>
  );
}
