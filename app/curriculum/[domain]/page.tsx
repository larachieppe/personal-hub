import Link from "next/link";
import { notFound } from "next/navigation";
import { getDomains, getDomain, computeDomainProgress } from "@/lib/curriculum";
import ProgressBar from "@/components/ProgressBar";
import StatusBadge from "@/components/StatusBadge";

export async function generateStaticParams() {
  return getDomains().map((domain) => ({ domain: domain.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain: domainId } = await params;
  const domain = getDomain(domainId);
  return { title: domain ? `${domain.name} — Polymath Hub` : "Not found" };
}

export default async function DomainPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain: domainId } = await params;
  const domain = getDomain(domainId);

  if (!domain) {
    notFound();
  }

  const progress = computeDomainProgress(domain);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/curriculum"
          className="text-sm text-emerald-600 hover:underline dark:text-emerald-400"
        >
          &larr; All domains
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{domain.name}</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {domain.description}
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <ProgressBar percent={progress.percentDone} />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {progress.done} done · {progress.inProgress} in progress ·{" "}
            {progress.notStarted} not started
          </span>
        </div>
      </div>

      <div className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
        {domain.topics.map((topic) => (
          <div key={topic.id} className="flex flex-col gap-2 py-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-base font-medium">{topic.title}</h2>
              <StatusBadge status={topic.status} />
            </div>
            {topic.notes && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {topic.notes}
              </p>
            )}
            {topic.resources.length > 0 && (
              <ul className="mt-1 flex flex-col gap-1">
                {topic.resources.map((resource) => (
                  <li key={resource.title} className="text-sm">
                    {resource.url ? (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:underline dark:text-emerald-400"
                      >
                        {resource.title}
                      </a>
                    ) : (
                      <span>{resource.title}</span>
                    )}
                    <span className="ml-2 text-xs text-zinc-400 dark:text-zinc-500">
                      {resource.type}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
