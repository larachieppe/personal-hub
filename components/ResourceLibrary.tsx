"use client";

import { useMemo, useState } from "react";
import { getAllResources, mergeCustomResources } from "@/lib/curriculum";
import type { Domain } from "@/lib/curriculum";
import { toggleResourceCompleted, useCompletedResources } from "@/lib/progress-store";
import { discardResource, restoreResource, useDiscardedResources } from "@/lib/discard-store";
import { removeCustomResource, useCustomResources } from "@/lib/custom-resources-store";

export default function ResourceLibrary({
  domains: allDomains,
}: {
  domains: Domain[];
}) {
  const completed = useCompletedResources();
  const discarded = useDiscardedResources();
  const custom = useCustomResources();
  const resources = useMemo(
    () => getAllResources(mergeCustomResources(allDomains, custom)),
    [allDomains, custom]
  );
  const [query, setQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showDiscarded, setShowDiscarded] = useState(false);

  const visibleResources = useMemo(
    () => resources.filter((r) => !discarded.has(r.key)),
    [resources, discarded]
  );
  const discardedResources = useMemo(
    () => resources.filter((r) => discarded.has(r.key)),
    [resources, discarded]
  );

  const domains = useMemo(
    () => Array.from(new Set(visibleResources.map((r) => r.domainName))).sort(),
    [visibleResources]
  );
  const types = useMemo(
    () => Array.from(new Set(visibleResources.map((r) => r.type))).sort(),
    [visibleResources]
  );

  const filtered = visibleResources.filter((resource) => {
    const matchesQuery =
      query.trim() === "" ||
      resource.title.toLowerCase().includes(query.toLowerCase()) ||
      resource.topicTitle.toLowerCase().includes(query.toLowerCase());
    const matchesDomain = domainFilter === "all" || resource.domainName === domainFilter;
    const matchesType = typeFilter === "all" || resource.type === typeFilter;
    return matchesQuery && matchesDomain && matchesType;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Search the catalog..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="field flex-1"
        />
        <select
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          className="field"
        >
          <option value="all">All domains</option>
          {domains.map((domain) => (
            <option key={domain} value={domain}>
              {domain}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="field"
        >
          <option value="all">All types</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm italic text-muted">
          No resources match your filters yet.
        </p>
      ) : (
        <ul className="panel flex flex-col divide-y divide-border/70">
          {filtered.map((resource, i) => {
            const key = resource.key;
            const isChecked = completed.has(key);
            return (
              <li
                key={`${resource.topicId}-${resource.title}-${i}`}
                className="flex items-start gap-2.5 py-4"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleResourceCompleted(key)}
                  className="mt-1.5 h-4 w-4 shrink-0 cursor-pointer accent-gold"
                  aria-label={`Mark "${resource.title}" as done`}
                />
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between gap-4">
                    {resource.url ? (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={
                          isChecked
                            ? "font-display text-base italic text-muted line-through hover:underline"
                            : "font-display text-base italic text-gold hover:text-foreground hover:underline"
                        }
                      >
                        {resource.title}
                      </a>
                    ) : (
                      <span
                        className={
                          isChecked
                            ? "font-display text-base italic text-muted line-through"
                            : "font-display text-base italic text-foreground"
                        }
                      >
                        {resource.title}
                      </span>
                    )}
                    <span className="text-xs uppercase tracking-wide text-muted">
                      {resource.type}
                    </span>
                  </div>
                  <span className="text-xs uppercase tracking-wide text-muted">
                    {resource.domainName} · {resource.topicTitle}
                    {resource.courseTitle && <> · {resource.courseTitle}</>}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => discardResource(key)}
                  className="mt-1 shrink-0 text-xs uppercase tracking-wide text-muted transition-colors hover:text-wine"
                  aria-label={`Discard "${resource.title}"`}
                >
                  Discard
                </button>
                {resource.custom && (
                  <button
                    type="button"
                    onClick={() => removeCustomResource(resource.domainId, resource.topicId, resource.title)}
                    className="mt-1 shrink-0 text-xs uppercase tracking-wide text-muted transition-colors hover:text-wine"
                    aria-label={`Remove "${resource.title}"`}
                  >
                    Remove
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {discardedResources.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-border pt-6">
          <button
            type="button"
            onClick={() => setShowDiscarded((s) => !s)}
            className="w-fit text-xs uppercase tracking-wide text-muted transition-colors hover:text-foreground"
          >
            {showDiscarded ? "Hide" : "Show"} discarded ({discardedResources.length})
          </button>
          {showDiscarded && (
            <ul className="panel flex flex-col divide-y divide-border/70">
              {discardedResources.map((resource, i) => {
                const key = resource.key;
                return (
                  <li
                    key={`discarded-${resource.topicId}-${resource.title}-${i}`}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-display text-base italic text-muted line-through">
                        {resource.title}
                      </span>
                      <span className="text-xs uppercase tracking-wide text-muted">
                        {resource.domainName} · {resource.topicTitle}
                        {resource.courseTitle && <> · {resource.courseTitle}</>}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => restoreResource(key)}
                      className="shrink-0 text-xs uppercase tracking-wide text-gold transition-colors hover:text-foreground"
                    >
                      Restore
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
