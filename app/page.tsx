import Link from "next/link";
import motivation from "@/data/motivation.json";
import { getDomains, computeDomainProgress, computeOverallProgress } from "@/lib/curriculum";
import ProgressBar from "@/components/ProgressBar";
import QuoteOfDay from "@/components/QuoteOfDay";

export default function Home() {
  const domains = getDomains();
  const overall = computeOverallProgress(domains);

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
          Mission
        </p>
        <h1 className="text-2xl font-semibold leading-snug sm:text-3xl">
          {motivation.mission}
        </h1>
        <QuoteOfDay />
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            Overall progress
          </h2>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {overall.done} / {overall.total} topics done
          </span>
        </div>
        <ProgressBar percent={overall.percentDone} />
        <div className="flex gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <span>{overall.done} done</span>
          <span>{overall.inProgress} in progress</span>
          <span>{overall.notStarted} not started</span>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            Domains
          </h2>
          <Link
            href="/curriculum"
            className="text-sm text-emerald-600 hover:underline dark:text-emerald-400"
          >
            View full curriculum &rarr;
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {domains.map((domain) => {
            const progress = computeDomainProgress(domain);
            return (
              <Link
                key={domain.id}
                href={`/curriculum/${domain.id}`}
                className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-4 transition-colors hover:border-emerald-500 dark:border-zinc-800"
              >
                <span className="text-sm font-medium">{domain.name}</span>
                <ProgressBar percent={progress.percentDone} />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {progress.done} / {progress.total} done
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
