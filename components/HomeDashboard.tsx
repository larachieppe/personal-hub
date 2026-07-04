"use client";

import Link from "next/link";
import type { Domain } from "@/lib/curriculum";
import { computeDomainProgress, computeOverallProgress } from "@/lib/curriculum";
import { useCompletedResources } from "@/lib/progress-store";
import ProgressBar from "@/components/ProgressBar";
import StatusBadge from "@/components/StatusBadge";
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
  const overall = computeOverallProgress(domains, completed);
  const milestone = overallMilestoneMessage(overall.percent);

  return (
    <>
      <section className="flex flex-col gap-4 border border-border bg-surface p-6">
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
        {milestone && (
          <p className="text-xs italic text-gold">{milestone}</p>
        )}
      </section>

      <WhatsNext domains={domains} />

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
          {domains.map((domain) => {
            const progress = computeDomainProgress(domain, completed);
            return (
              <Link
                key={domain.id}
                href={`/curriculum/${domain.id}`}
                className="flex flex-col gap-3 border border-border border-t-2 border-t-gold-dim bg-surface p-4 transition-colors hover:border-t-gold hover:bg-surface-hover"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-base text-foreground">
                    {domain.name}
                  </span>
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
