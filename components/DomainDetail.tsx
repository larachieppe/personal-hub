"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Course, Domain, Resource, ResourceType, TopicStatus } from "@/lib/curriculum";
import {
  computeCourseProgress,
  computeDomainProgress,
  computeTopicProgress,
  filterOutDiscarded,
  isCourse,
  mergeCustomResources,
  resourceKey,
  sectionKey,
} from "@/lib/curriculum";
import { toggleResourceCompleted, useCompletedResources } from "@/lib/progress-store";
import { discardResource, useDiscardedResources } from "@/lib/discard-store";
import {
  addCustomResource,
  removeCustomResource,
  useCustomResources,
} from "@/lib/custom-resources-store";
import ProgressBar from "@/components/ProgressBar";
import StatusBadge from "@/components/StatusBadge";
import DomainIcon from "@/components/DomainIcon";
import Ornament from "@/components/Ornament";

export default function DomainDetail({ domain: rawDomain }: { domain: Domain }) {
  const completed = useCompletedResources();
  const discarded = useDiscardedResources();
  const custom = useCustomResources();
  const domain = useMemo(
    () => filterOutDiscarded(mergeCustomResources([rawDomain], custom), discarded)[0],
    [rawDomain, custom, discarded]
  );
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
        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-gold-dim bg-surface">
            <DomainIcon domainId={domain.id} className="h-6 w-6 text-gold" />
          </div>
          <h1 className="font-display text-3xl italic text-foreground">
            {domain.name}
          </h1>
          {progress.percent === 100 && <StatusBadge status="done" />}
        </div>
        <p className="mt-3 text-sm text-muted">{domain.description}</p>
        <div className="mt-4 flex flex-col gap-2">
          <ProgressBar percent={progress.percent} />
          <span className="text-xs uppercase tracking-wide text-muted">
            {progress.masteredTopics} mastered · {progress.inProgressTopics} in progress ·{" "}
            {progress.notStartedTopics} uncharted
          </span>
        </div>
      </div>

      <Ornament />

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
                  {topic.resources.map((item) =>
                    isCourse(item) ? (
                      <CourseGroup
                        key={item.title}
                        domainId={domain.id}
                        topicId={topic.id}
                        course={item}
                        completed={completed}
                      />
                    ) : (
                      <FlatResourceRow
                        key={resourceKey(domain.id, topic.id, item)}
                        domainId={domain.id}
                        topicId={topic.id}
                        resource={item}
                        completed={completed}
                      />
                    )
                  )}
                </ul>
              )}
              <AddResourceForm domainId={domain.id} topicId={topic.id} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FlatResourceRow({
  domainId,
  topicId,
  resource,
  completed,
}: {
  domainId: string;
  topicId: string;
  resource: Resource;
  completed: ReadonlySet<string>;
}) {
  const key = resourceKey(domainId, topicId, resource);
  const isChecked = completed.has(key);

  return (
    <li className="flex items-start gap-2.5 text-sm">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={() => toggleResourceCompleted(key)}
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-gold"
        aria-label={`Mark "${resource.title}" as done`}
      />
      <span className={`flex-1 ${isChecked ? "text-muted line-through" : ""}`}>
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
          <span className={isChecked ? "" : "text-foreground"}>{resource.title}</span>
        )}
        <span className="ml-2 text-xs uppercase tracking-wide text-muted">
          {resource.type}
        </span>
      </span>
      <button
        type="button"
        onClick={() => discardResource(key)}
        className="shrink-0 text-xs uppercase tracking-wide text-muted transition-colors hover:text-wine"
        aria-label={`Discard "${resource.title}"`}
      >
        Discard
      </button>
      {resource.custom && (
        <button
          type="button"
          onClick={() => removeCustomResource(domainId, topicId, resource.title)}
          className="shrink-0 text-xs uppercase tracking-wide text-muted transition-colors hover:text-wine"
          aria-label={`Remove "${resource.title}"`}
        >
          Remove
        </button>
      )}
    </li>
  );
}

function courseStatus(checked: number, total: number): TopicStatus {
  return total === 0 || checked === 0 ? "not-started" : checked === total ? "done" : "in-progress";
}

function CourseGroup({
  domainId,
  topicId,
  course,
  completed,
}: {
  domainId: string;
  topicId: string;
  course: Course;
  completed: ReadonlySet<string>;
}) {
  const [expanded, setExpanded] = useState(false);
  const progress = computeCourseProgress(domainId, topicId, course, completed);

  return (
    <li className="flex flex-col gap-2 border border-border bg-surface p-3">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center justify-between gap-4 text-left"
      >
        <span className="flex items-center gap-2">
          <span className="font-display text-sm text-foreground">{course.title}</span>
          <span className="text-xs uppercase tracking-wide text-muted">
            {expanded ? "▾" : "▸"} {progress.checked}/{progress.total} sections
          </span>
        </span>
        <StatusBadge status={courseStatus(progress.checked, progress.total)} />
      </button>
      {expanded && (
        <ul className="mt-1 flex flex-col gap-2 border-t border-border/60 pt-2">
          {course.sections.map((section) => {
            const key = sectionKey(domainId, topicId, course, section);
            const isChecked = completed.has(key);
            return (
              <li key={key} className="flex items-start gap-2.5 pl-2 text-sm">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleResourceCompleted(key)}
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-gold"
                  aria-label={`Mark "${section.title}" as done`}
                />
                <span className={`flex-1 ${isChecked ? "text-muted line-through" : ""}`}>
                  {section.url ? (
                    <a
                      href={section.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={
                        isChecked
                          ? "hover:underline"
                          : "text-gold hover:text-foreground hover:underline"
                      }
                    >
                      {section.title}
                    </a>
                  ) : (
                    <span className={isChecked ? "" : "text-foreground"}>{section.title}</span>
                  )}
                  <span className="ml-2 text-xs uppercase tracking-wide text-muted">
                    {course.sectionType}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => discardResource(key)}
                  className="shrink-0 text-xs uppercase tracking-wide text-muted transition-colors hover:text-wine"
                  aria-label={`Discard "${section.title}"`}
                >
                  Discard
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

const RESOURCE_TYPES: ResourceType[] = ["article", "video", "book", "paper", "other"];

function AddResourceForm({ domainId, topicId }: { domainId: string; topicId: string }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<ResourceType>("article");
  const [isOpen, setIsOpen] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    const resource: Resource = { title: trimmedTitle, url: url.trim(), type };
    addCustomResource(domainId, topicId, resource);
    setTitle("");
    setUrl("");
    setType("article");
    setIsOpen(false);
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-1 w-fit text-xs uppercase tracking-wide text-gold transition-colors hover:text-foreground"
      >
        + Add a resource
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-1 flex flex-col gap-2 border border-border bg-surface p-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        autoFocus
        className="border border-border bg-transparent px-2 py-1 text-sm text-foreground placeholder:text-muted focus:border-gold focus:outline-none"
      />
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="URL (optional)"
        className="border border-border bg-transparent px-2 py-1 text-sm text-foreground placeholder:text-muted focus:border-gold focus:outline-none"
      />
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as ResourceType)}
          className="border border-border bg-background px-2 py-1 text-sm text-foreground focus:border-gold focus:outline-none"
        >
          {RESOURCE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="border border-gold bg-gold px-3 py-1 text-xs uppercase tracking-wide text-background transition-colors hover:border-gold-dim hover:bg-gold-dim"
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-xs uppercase tracking-wide text-muted transition-colors hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
