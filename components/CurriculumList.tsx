"use client";

import Link from "next/link";
import type { Domain } from "@/lib/curriculum";
import { computeDomainProgress } from "@/lib/curriculum";
import { useCompletedResources } from "@/lib/progress-store";
import ProgressBar from "@/components/ProgressBar";
import StatusBadge from "@/components/StatusBadge";

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
            className="group flex flex-col gap-2 py-5 transition-colors"
          >
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
          </Link>
        );
      })}
    </div>
  );
}
