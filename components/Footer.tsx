import Link from "next/link";
import motivation from "@/data/motivation.json";

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-2 px-6 py-6 text-center">
        <p className="text-xs italic tracking-wide text-muted">{motivation.motto}</p>
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
