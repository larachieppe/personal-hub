import Link from "next/link";
import { getDomains, computeDomainProgress } from "@/lib/curriculum";
import ProgressBar from "@/components/ProgressBar";

export const metadata = {
  title: "Curriculum — Polymath Hub",
};

export default function CurriculumPage() {
  const domains = getDomains();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Domains of Study
        </p>
        <h1 className="font-display mt-2 text-3xl italic text-foreground">
          The Curriculum
        </h1>
        <p className="mt-2 text-sm text-muted">
          Every domain you&apos;re building competence in. Edit{" "}
          <code className="border border-border bg-surface px-1 py-0.5 text-foreground">
            data/curriculum.json
          </code>{" "}
          to add topics or update status.
        </p>
      </div>
      <div className="flex flex-col divide-y divide-border">
        {domains.map((domain) => {
          const progress = computeDomainProgress(domain);
          return (
            <Link
              key={domain.id}
              href={`/curriculum/${domain.id}`}
              className="group flex flex-col gap-2 py-5 transition-colors"
            >
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-lg text-foreground group-hover:text-gold">
                  {domain.name}
                </h2>
                <span className="text-xs uppercase tracking-wide text-muted">
                  {progress.done} / {progress.total} mastered
                </span>
              </div>
              <p className="text-sm text-muted">{domain.description}</p>
              <ProgressBar percent={progress.percentProgress} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
