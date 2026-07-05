"use client";

import Link from "next/link";
import type { Domain } from "@/lib/curriculum";
import { computeDomainProgress } from "@/lib/curriculum";
import { useCompletedResources } from "@/lib/progress-store";
import ProgressBar from "@/components/ProgressBar";
import StatusBadge from "@/components/StatusBadge";
import DomainIcon from "@/components/DomainIcon";

export default function CurriculumList({ domains }: { domains: Domain[] }) {
  const completed = useCompletedResources();

  return (
    <div className="flex flex-col divide-y divide-border">
      {domains.map((domain) => {
        const progress = computeDomainProgress(domain, completed);
        return (
          <Link
            key={domain.id}
            href={`/curriculum/${domain.id}`}
            className="group flex gap-4 py-6 transition-colors"
          >
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-surface transition-colors group-hover:border-gold-dim">
              <DomainIcon
                domainId={domain.id}
                className="h-5 w-5 text-gold-dim transition-colors group-hover:text-gold"
              />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-lg text-foreground group-hover:text-gold">
                    {domain.name}
                  </h2>
                  {progress.percent === 100 && <StatusBadge status="done" />}
                </div>
                <span className="text-xs uppercase tracking-wide text-muted">
                  {progress.masteredTopics} / {progress.totalTopics} mastered
                </span>
              </div>
              <p className="text-sm text-muted">{domain.description}</p>
              <ProgressBar percent={progress.percent} />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
