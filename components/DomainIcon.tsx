import type { ReactNode } from "react";

const PATHS: Record<string, string> = {
  business:
    "M12 3v18M7 7h10M5 7l-2 5a3 3 0 0 0 6 0L5 7zM19 7l-2 5a3 3 0 0 0 6 0l-2-5zM8 21h8",
  "computer-science":
    "M9 7V4M12 7V4M15 7V4M9 20v-3M12 20v-3M15 20v-3M7 9H4M7 12H4M7 15H4M20 9h-3M20 12h-3M20 15h-3",
  technology:
    "M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1",
  startups:
    "M12 2c2.5 2 4 5.5 4 9 0 2-.5 3.5-1 4.5l-3 2-3-2c-.5-1-1-2.5-1-4.5 0-3.5 1.5-7 4-9zM9 15l-2.5 1.5L7 20M15 15l2.5 1.5L17 20M10 18h4",
  biotech:
    "M7 3c0 4 10 4 10 8s-10 4-10 8M17 3c0 4-10 4-10 8s10 4 10 8M8 6h8M8 18h8M7 12h10",
  "product-management": "M12 2v4M12 18v4M2 12h4M18 12h4",
};

const EXTRA: Record<string, ReactNode> = {
  "computer-science": <rect x="7" y="7" width="10" height="10" rx="1" />,
  technology: <circle cx="12" cy="12" r="3" />,
  startups: <circle cx="12" cy="9" r="1.3" fill="currentColor" stroke="none" />,
  "product-management": (
    <>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
};

export default function DomainIcon({
  domainId,
  className,
}: {
  domainId: string;
  className?: string;
}) {
  const path = PATHS[domainId];
  if (!path) return null;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {EXTRA[domainId]}
      <path d={path} />
    </svg>
  );
}
