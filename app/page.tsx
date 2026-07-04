import Link from "next/link";
import motivation from "@/data/motivation.json";
import { getDomains, computeDomainProgress, computeOverallProgress } from "@/lib/curriculum";
import ProgressBar from "@/components/ProgressBar";
import QuoteOfDay from "@/components/QuoteOfDay";
import DaysCounter from "@/components/DaysCounter";

export default function Home() {
  const domains = getDomains();
  const overall = computeOverallProgress(domains);

  return (
    <div className="flex flex-col gap-14">
      <section className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            The Pursuit
          </p>
          <DaysCounter />
        </div>
        <h1 className="font-display text-3xl italic leading-snug text-foreground first-letter:mr-1 first-letter:float-left first-letter:font-display first-letter:text-6xl first-letter:not-italic first-letter:text-gold sm:text-4xl">
          {motivation.mission}
        </h1>
        <QuoteOfDay />
      </section>

      <section className="flex flex-col gap-4 border border-border bg-surface p-6">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-sm uppercase tracking-[0.2em] text-muted">
            The Ledger
          </h2>
          <span className="text-sm text-muted">
            {overall.done} / {overall.total} topics mastered
          </span>
        </div>
        <ProgressBar percent={overall.percentDone} />
        <div className="flex gap-4 text-xs uppercase tracking-wide text-muted">
          <span>{overall.done} mastered</span>
          <span className="text-gold-dim">·</span>
          <span>{overall.inProgress} in progress</span>
          <span className="text-gold-dim">·</span>
          <span>{overall.notStarted} uncharted</span>
        </div>
      </section>

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
            const progress = computeDomainProgress(domain);
            return (
              <Link
                key={domain.id}
                href={`/curriculum/${domain.id}`}
                className="flex flex-col gap-3 border border-border border-t-2 border-t-gold-dim bg-surface p-4 transition-colors hover:border-t-gold hover:bg-surface-hover"
              >
                <span className="font-display text-base text-foreground">
                  {domain.name}
                </span>
                <ProgressBar percent={progress.percentDone} />
                <span className="text-xs uppercase tracking-wide text-muted">
                  {progress.done} / {progress.total} mastered
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
