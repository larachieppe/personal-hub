import Link from "next/link";
import motivation from "@/data/motivation.json";

export default function Footer() {
  return (
    <footer className="border-t border-border/80">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2.5 px-6 py-8 text-center sm:px-8">
        <p className="font-display text-sm italic tracking-wide text-muted">{motivation.motto}</p>
        <Link
          href="/backup"
          className="text-xs uppercase tracking-wide text-muted transition-colors hover:text-gold"
        >
          Backup your data
        </Link>
      </div>
    </footer>
  );
}
