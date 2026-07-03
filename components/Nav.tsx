import Link from "next/link";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/curriculum", label: "Curriculum" },
  { href: "/resources", label: "Resources" },
];

export default function Nav() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Polymath Hub
        </Link>
        <div className="flex gap-6 text-sm text-zinc-600 dark:text-zinc-400">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-zinc-950 dark:hover:text-zinc-50"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
