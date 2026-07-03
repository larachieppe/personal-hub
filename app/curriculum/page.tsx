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
        <h1 className="text-2xl font-semibold">Curriculum</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Every domain you&apos;re building competence in. Edit{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 dark:bg-zinc-800">
            data/curriculum.json
          </code>{" "}
          to add topics or update status.
        </p>
      </div>
      <div className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
        {domains.map((domain) => {
          const progress = computeDomainProgress(domain);
          return (
            <Link
              key={domain.id}
              href={`/curriculum/${domain.id}`}
              className="flex flex-col gap-2 py-5 transition-opacity hover:opacity-70"
            >
              <div className="flex items-baseline justify-between">
                <h2 className="text-base font-medium">{domain.name}</h2>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {progress.done} / {progress.total} done
                </span>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {domain.description}
              </p>
              <ProgressBar percent={progress.percentDone} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
