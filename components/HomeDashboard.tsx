"use client";

import Link from "next/link";
import type { Domain } from "@/lib/curriculum";
import {
  computeDomainProgress,
  computeOverallProgress,
  filterOutDiscarded,
  mergeCustomResources,
} from "@/lib/curriculum";
import { useCompletedResources } from "@/lib/progress-store";
import { useDiscardedResources } from "@/lib/discard-store";
import { useCustomResources } from "@/lib/custom-resources-store";
import ProgressBar from "@/components/ProgressBar";
import StatusBadge from "@/components/StatusBadge";
import DomainIcon from "@/components/DomainIcon";
import Ornament from "@/components/Ornament";
import WhatsNext from "@/components/WhatsNext";

function overallMilestoneMessage(percent: number): string | null {
  if (percent >= 100) return "Every resource in the curriculum is checked off.";
  if (percent >= 75) return "Three-quarters of the way through the curriculum.";
  if (percent >= 50) return "Halfway through the curriculum.";
  if (percent >= 25) return "A quarter of the way through the curriculum.";
  return null;
}

export default function HomeDashboard({ domains }: { domains: Domain[] }) {
  const completed = useCompletedResources();
  const discarded = useDiscardedResources();
  const custom = useCustomResources();
  const visibleDomains = filterOutDiscarded(mergeCustomResources(domains, custom), discarded);
  const overall = computeOverallProgress(visibleDomains, completed);
  const milestone = overallMilestoneMessage(overall.percent);

  return (
    <>
      <Ornament />

      <section className="panel flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-sm uppercase tracking-[0.2em] text-muted">
            The Ledger
          </h2>
          <span className="text-sm text-muted">
            {overall.masteredTopics} / {overall.totalTopics} topics mastered
          </span>
        </div>
        <ProgressBar percent={overall.percent} />
        <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-wide text-muted">
          <span>{overall.masteredTopics} mastered</span>
          <span className="text-gold-dim">·</span>
          <span>{overall.inProgressTopics} in progress</span>
          <span className="text-gold-dim">·</span>
          <span>{overall.notStartedTopics} uncharted</span>
        </div>
        {milestone && <p className="text-xs italic text-gold">{milestone}</p>}
      </section>

      <WhatsNext domains={visibleDomains} />

      <Ornament />

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-sm uppercase tracking-[0.2em] text-muted">
            Domains of Study
          </h2>
          <Link
            href="/curriculum"
            className="text-sm text-gold transition-colors hover:text-foreground"
          >
            View full curriculum &rarr;
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {visibleDomains.map((domain) => {
            const progress = computeDomainProgress(domain, completed);
            return (
              <Link
                key={domain.id}
                href={`/curriculum/${domain.id}`}
                className="group panel panel-interactive flex flex-col gap-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background/60 transition-colors group-hover:border-gold-dim">
                      <DomainIcon
                        domainId={domain.id}
                        className="h-4 w-4 shrink-0 text-gold-dim transition-colors group-hover:text-gold"
                      />
                    </span>
                    <span className="font-display text-lg text-foreground">
                      {domain.name}
                    </span>
                  </div>
                  {progress.percent === 100 && <StatusBadge status="done" />}
                </div>
                <ProgressBar percent={progress.percent} />
                <span className="text-xs uppercase tracking-wide text-muted">
                  {progress.masteredTopics} / {progress.totalTopics} mastered
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
