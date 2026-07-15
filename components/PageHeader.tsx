import type { ReactNode } from "react";
import Ornament from "@/components/Ornament";

export default function PageHeader({
  eyebrow,
  title,
  description,
  ornament = true,
  aside,
}: {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  ornament?: boolean;
  aside?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <p className="eyebrow">{eyebrow}</p>
          {aside}
        </div>
        <h1 className="font-display text-4xl italic leading-[1.05] tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-base leading-relaxed text-muted">{description}</p>
        )}
      </div>
      {ornament && <Ornament />}
    </div>
  );
}
