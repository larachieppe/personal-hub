"use client";

import Link from "next/link";
import type { Domain } from "@/lib/curriculum";
import { computeDomainProgress, computeTopicProgress, resourceKey } from "@/lib/curriculum";
import { toggleResourceCompleted, useCompletedResources } from "@/lib/progress-store";
import ProgressBar from "@/components/ProgressBar";
import StatusBadge from "@/components/StatusBadge";

export default function DomainDetail({ domain }: { domain: Domain }) {
  const completed = useCompletedResources();
  const progress = computeDomainProgress(domain, completed);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/curriculum"
          className="text-sm text-gold transition-colors hover:text-foreground"
        >
          &larr; All domains
        </Link>
        <h1 className="font-display mt-3 text-3xl italic text-foreground">
          {domain.name}
        </h1>
        <p className="mt-1 text-sm text-muted">{domain.description}</p>
        <div className="mt-4 flex flex-col gap-2">
          <ProgressBar percent={progress.percent} />
          <span className="text-xs uppercase tracking-wide text-muted">
            {progress.masteredTopics} mastered · {progress.inProgressTopics} in progress ·{" "}
            {progress.notStartedTopics} uncharted
          </span>
        </div>
      </div>

      <div className="flex flex-col divide-y divide-border">
        {domain.topics.map((topic) => {
          const topicProgress = computeTopicProgress(domain.id, topic, completed);
          return (
            <div key={topic.id} className="flex flex-col gap-2 py-5">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-display text-lg text-foreground">{topic.title}</h2>
                <StatusBadge status={topicProgress.status} />
              </div>
              {topic.notes && (
                <p className="text-sm italic text-muted">{topic.notes}</p>
              )}
              {topic.resources.length > 0 && (
                <ul className="mt-1 flex flex-col gap-2">
                  {topic.resources.map((resource) => {
                    const key = resourceKey(domain.id, topic.id, resource);
                    const isChecked = completed.has(key);
                    return (
                      <li key={key} className="flex items-start gap-2.5 text-sm">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleResourceCompleted(key)}
                          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-gold"
                          aria-label={`Mark "${resource.title}" as done`}
                        />
                        <span className={isChecked ? "text-muted line-through" : ""}>
                          {resource.url ? (
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={
                                isChecked
                                  ? "hover:underline"
                                  : "text-gold hover:text-foreground hover:underline"
                              }
                            >
                              {resource.title}
                            </a>
                          ) : (
                            <span className={isChecked ? "" : "text-foreground"}>
                              {resource.title}
                            </span>
                          )}
                          <span className="ml-2 text-xs uppercase tracking-wide text-muted">
                            {resource.type}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
