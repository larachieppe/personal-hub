"use client";

import Link from "next/link";
import type { Domain } from "@/lib/curriculum";
import { computeDomainProgress, computeOverallProgress, filterOutDiscarded } from "@/lib/curriculum";
import { useCompletedResources } from "@/lib/progress-store";
import { useDiscardedResources } from "@/lib/discard-store";
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
  const visibleDomains = filterOutDiscarded(domains, discarded);
  const overall = computeOverallProgress(visibleDomains, completed);
  const milestone = overallMilestoneMessage(overall.percent);

  return (
    <>
      <Ornament />

      <section className="flex flex-col gap-4 border border-border bg-surface p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_16px_32px_-20px_rgba(0,0,0,0.85)]">
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
        <div className="grid gap-4 sm:grid-cols-2">
          {visibleDomains.map((domain) => {
            const progress = computeDomainProgress(domain, completed);
            return (
              <Link
                key={domain.id}
                href={`/curriculum/${domain.id}`}
                className="group flex flex-col gap-3 border border-border border-t-2 border-t-gold-dim bg-surface p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_10px_24px_-16px_rgba(0,0,0,0.8)] transition-all duration-200 hover:-translate-y-0.5 hover:border-t-gold hover:bg-surface-hover hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_18px_32px_-16px_rgba(0,0,0,0.9)]"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <DomainIcon
                      domainId={domain.id}
                      className="h-5 w-5 shrink-0 text-gold-dim transition-colors group-hover:text-gold"
                    />
                    <span className="font-display text-base text-foreground">
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
