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
import { resolveResourceMeta } from "@/lib/resource-meta";
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
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold-dim bg-surface">
            <DomainIcon domainId={domain.id} className="h-6 w-6 text-gold" />
          </div>
          <h1 className="font-display text-4xl italic tracking-tight text-foreground">
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

      <div className="flex flex-col gap-4">
        {domain.topics.map((topic) => {
          const topicProgress = computeTopicProgress(domain.id, topic, completed);
          return (
            <div key={topic.id} className="panel flex flex-col gap-2">
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
    <li className="flex flex-col gap-2 rounded-lg border border-border bg-background/40 p-3">
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
      {course.notes && <p className="text-xs italic text-muted">{course.notes}</p>}
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
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ResourceType>("article");
  const [titleTouched, setTitleTouched] = useState(false);
  const [typeTouched, setTypeTouched] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  function resetForm() {
    setUrl("");
    setTitle("");
    setType("article");
    setTitleTouched(false);
    setTypeTouched(false);
    setIsResolving(false);
    setIsOpen(false);
  }

  async function autofillFromUrl(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    setIsResolving(true);
    const meta = await resolveResourceMeta(trimmed);
    setIsResolving(false);
    if (!titleTouched) setTitle(meta.title);
    if (!typeTouched) setType(meta.type);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedUrl = url.trim();
    let finalTitle = title.trim();
    let finalType = type;

    if (trimmedUrl && !finalTitle) {
      setIsResolving(true);
      const meta = await resolveResourceMeta(trimmedUrl);
      setIsResolving(false);
      finalTitle = meta.title;
      if (!typeTouched) finalType = meta.type;
    }

    if (!finalTitle) finalTitle = trimmedUrl;
    if (!finalTitle) return;

    addCustomResource(domainId, topicId, { title: finalTitle, url: trimmedUrl, type: finalType });
    resetForm();
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
    <form onSubmit={handleSubmit} className="mt-1 flex flex-col gap-2 rounded-lg border border-border bg-background/40 p-3">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onBlur={(e) => autofillFromUrl(e.target.value)}
        placeholder="Paste a link — title and type are filled in for you"
        autoFocus
        className="field"
      />
      <input
        type="text"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setTitleTouched(true);
        }}
        placeholder={isResolving ? "Fetching title…" : "Title (auto-filled — edit if you like)"}
        className="field"
      />
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value as ResourceType);
            setTypeTouched(true);
          }}
          className="field"
        >
          {RESOURCE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button type="submit" disabled={isResolving} className="btn-gold disabled:cursor-wait disabled:opacity-60">
          Add
        </button>
        <button
          type="button"
          onClick={resetForm}
          className="text-xs uppercase tracking-wide text-muted transition-colors hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
