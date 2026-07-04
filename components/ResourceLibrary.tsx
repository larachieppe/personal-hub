"use client";

import { useMemo, useState } from "react";
import { resourceKey } from "@/lib/curriculum";
import type { ResourceWithContext } from "@/lib/curriculum";
import { toggleResourceCompleted, useCompletedResources } from "@/lib/progress-store";

export default function ResourceLibrary({
  resources,
}: {
  resources: ResourceWithContext[];
}) {
  const completed = useCompletedResources();
  const [query, setQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const domains = useMemo(
    () => Array.from(new Set(resources.map((r) => r.domainName))).sort(),
    [resources]
  );
  const types = useMemo(
    () => Array.from(new Set(resources.map((r) => r.type))).sort(),
    [resources]
  );

  const filtered = resources.filter((resource) => {
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
          className="flex-1 border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted focus:border-gold"
        />
        <select
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          className="border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
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
          className="border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
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
        <ul className="flex flex-col divide-y divide-border">
          {filtered.map((resource, i) => {
            const key = resourceKey(resource.domainId, resource.topicId, resource);
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
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
