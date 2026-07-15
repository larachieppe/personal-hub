"use client";

import Link from "next/link";
import type { Domain } from "@/lib/curriculum";
import { computeDomainProgress, filterOutDiscarded, mergeCustomResources } from "@/lib/curriculum";
import { useCompletedResources } from "@/lib/progress-store";
import { useDiscardedResources } from "@/lib/discard-store";
import { useCustomResources } from "@/lib/custom-resources-store";
import ProgressBar from "@/components/ProgressBar";
import StatusBadge from "@/components/StatusBadge";
import DomainIcon from "@/components/DomainIcon";

export default function CurriculumList({ domains }: { domains: Domain[] }) {
  const completed = useCompletedResources();
  const discarded = useDiscardedResources();
  const custom = useCustomResources();
  const visibleDomains = filterOutDiscarded(mergeCustomResources(domains, custom), discarded);

  return (
    <div className="flex flex-col gap-4">
      {visibleDomains.map((domain) => {
        const progress = computeDomainProgress(domain, completed);
        return (
          <Link
            key={domain.id}
            href={`/curriculum/${domain.id}`}
            className="group panel panel-interactive flex gap-4"
          >
            <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-background/60 transition-colors group-hover:border-gold-dim">
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
