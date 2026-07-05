"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLink {
  href: string;
  label: string;
}

export default function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle navigation menu"
        aria-expanded={open}
        className="flex h-8 w-8 flex-col items-center justify-center gap-1.5"
      >
        <span
          className={`h-px w-5 bg-gold transition-transform ${open ? "translate-y-2 rotate-45" : ""}`}
        />
        <span
          className={`h-px w-5 bg-gold transition-opacity ${open ? "opacity-0" : ""}`}
        />
        <span
          className={`h-px w-5 bg-gold transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full border-b border-border bg-background px-6 py-4">
          <div className="flex flex-col gap-4 text-xs font-medium uppercase tracking-[0.15em] text-muted">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-gold"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
