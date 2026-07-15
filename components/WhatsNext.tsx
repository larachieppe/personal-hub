"use client";

import { useState } from "react";
import type { Domain } from "@/lib/curriculum";
import { getNextResources } from "@/lib/curriculum";
import { toggleResourceCompleted, useCompletedResources } from "@/lib/progress-store";
import { discardResource } from "@/lib/discard-store";

function pickIndex(seed: number, length: number): number {
  if (length === 0) return 0;
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return Math.floor((x - Math.floor(x)) * length);
}

export default function WhatsNext({ domains }: { domains: Domain[] }) {
  const completed = useCompletedResources();
  const [seed, setSeed] = useState(0);

  // One candidate per topic — the earliest resource in that topic that
  // isn't checked off yet — so a later lesson is never suggested ahead of
  // an earlier one in the same topic.
  const unchecked = getNextResources(domains, completed);

  if (unchecked.length === 0) {
    return (
      <section className="panel flex flex-col gap-2">
        <h2 className="font-display text-sm uppercase tracking-[0.2em] text-muted">
          What&apos;s Next
        </h2>
        <p className="text-sm italic text-muted">
          Every resource in the curriculum is checked off. Add more in{" "}
          <code className="rounded-md border border-border bg-background px-1.5 py-0.5 text-foreground">
            data/curriculum.json
          </code>
          , or go add a domain.
        </p>
      </section>
    );
  }

  const pick = unchecked[pickIndex(seed, unchecked.length)];
  const key = pick.key;

  return (
    <section className="panel flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-sm uppercase tracking-[0.2em] text-muted">
          What&apos;s Next
        </h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => discardResource(key)}
            className="text-xs uppercase tracking-wide text-muted transition-colors hover:text-wine"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className="text-xs uppercase tracking-wide text-gold transition-colors hover:text-foreground"
          >
            Shuffle
          </button>
        </div>
      </div>
      <div className="flex items-start gap-2.5">
        <input
          type="checkbox"
          checked={false}
          onChange={() => toggleResourceCompleted(key)}
          className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-gold"
          aria-label={`Mark "${pick.title}" as done`}
        />
        <div className="flex flex-col gap-1">
          {pick.url ? (
            <a
              href={pick.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display text-base italic text-gold hover:text-foreground hover:underline"
            >
              {pick.title}
            </a>
          ) : (
            <span className="font-display text-base italic text-foreground">
              {pick.title}
            </span>
          )}
          <span className="text-xs uppercase tracking-wide text-muted">
            {pick.domainName} · {pick.topicTitle}
            {pick.courseTitle && <> · {pick.courseTitle}</>} · {pick.type}
          </span>
        </div>
      </div>
    </section>
  );
}
