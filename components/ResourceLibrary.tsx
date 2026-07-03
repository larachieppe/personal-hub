"use client";

import { useMemo, useState } from "react";
import type { ResourceWithContext } from "@/lib/curriculum";

export default function ResourceLibrary({
  resources,
}: {
  resources: ResourceWithContext[];
}) {
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
          placeholder="Search resources..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700"
        />
        <select
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700"
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
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700"
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
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No resources match your filters yet.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
          {filtered.map((resource, i) => (
            <li key={`${resource.topicId}-${resource.title}-${i}`} className="flex flex-col gap-1 py-4">
              <div className="flex items-center justify-between gap-4">
                {resource.url ? (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                  >
                    {resource.title}
                  </a>
                ) : (
                  <span className="text-sm font-medium">{resource.title}</span>
                )}
                <span className="text-xs uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                  {resource.type}
                </span>
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {resource.domainName} · {resource.topicTitle}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
