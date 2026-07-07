import curriculumData from "@/data/curriculum.json";

export type TopicStatus = "not-started" | "in-progress" | "done";

export type ResourceType = "book" | "course" | "video" | "article" | "paper" | "other";

export interface Resource {
  title: string;
  url: string;
  type: ResourceType;
  custom?: boolean;
}

export interface Topic {
  id: string;
  title: string;
  resources: Resource[];
  notes?: string;
}

export interface Domain {
  id: string;
  name: string;
  description: string;
  topics: Topic[];
}

export interface TopicProgress {
  status: TopicStatus;
  total: number;
  checked: number;
}

export interface DomainProgress {
  totalTopics: number;
  masteredTopics: number;
  inProgressTopics: number;
  notStartedTopics: number;
  totalResources: number;
  checkedResources: number;
  percent: number;
}

export interface ResourceWithContext extends Resource {
  domainId: string;
  domainName: string;
  topicId: string;
  topicTitle: string;
}

export function getDomains(): Domain[] {
  return curriculumData.domains as Domain[];
}

export function getDomain(domainId: string): Domain | undefined {
  return getDomains().find((domain) => domain.id === domainId);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}

export function resourceKey(domainId: string, topicId: string, resource: Resource): string {
  return `${domainId}/${topicId}/${slugify(resource.title)}`;
}

export function computeTopicProgress(
  domainId: string,
  topic: Topic,
  completed: ReadonlySet<string>
): TopicProgress {
  const total = topic.resources.length;
  const checked = topic.resources.filter((resource) =>
    completed.has(resourceKey(domainId, topic.id, resource))
  ).length;
  const status: TopicStatus =
    total === 0 || checked === 0 ? "not-started" : checked === total ? "done" : "in-progress";
  return { status, total, checked };
}

export function computeDomainProgress(
  domain: Domain,
  completed: ReadonlySet<string>
): DomainProgress {
  let masteredTopics = 0;
  let inProgressTopics = 0;
  let notStartedTopics = 0;
  let totalResources = 0;
  let checkedResources = 0;

  for (const topic of domain.topics) {
    const progress = computeTopicProgress(domain.id, topic, completed);
    totalResources += progress.total;
    checkedResources += progress.checked;
    if (progress.status === "done") masteredTopics += 1;
    else if (progress.status === "in-progress") inProgressTopics += 1;
    else notStartedTopics += 1;
  }

  const percent =
    totalResources === 0 ? 0 : Math.round((checkedResources / totalResources) * 100);

  return {
    totalTopics: domain.topics.length,
    masteredTopics,
    inProgressTopics,
    notStartedTopics,
    totalResources,
    checkedResources,
    percent,
  };
}

export function computeOverallProgress(
  domains: Domain[],
  completed: ReadonlySet<string>
): DomainProgress {
  let totalTopics = 0;
  let masteredTopics = 0;
  let inProgressTopics = 0;
  let notStartedTopics = 0;
  let totalResources = 0;
  let checkedResources = 0;

  for (const domain of domains) {
    const progress = computeDomainProgress(domain, completed);
    totalTopics += progress.totalTopics;
    masteredTopics += progress.masteredTopics;
    inProgressTopics += progress.inProgressTopics;
    notStartedTopics += progress.notStartedTopics;
    totalResources += progress.totalResources;
    checkedResources += progress.checkedResources;
  }

  const percent =
    totalResources === 0 ? 0 : Math.round((checkedResources / totalResources) * 100);

  return {
    totalTopics,
    masteredTopics,
    inProgressTopics,
    notStartedTopics,
    totalResources,
    checkedResources,
    percent,
  };
}

export type CustomResourceMap = Record<string, Record<string, Resource[]>>;

/**
 * Merges user-added resources (from lib/custom-resources-store.ts) into the
 * domains loaded from curriculum.json. Custom resources are appended to the
 * end of their topic's list — after the curriculum's own resources — and
 * tagged `custom: true` so the UI can offer a permanent "Remove" alongside
 * the usual Discard.
 */
export function mergeCustomResources(domains: Domain[], custom: CustomResourceMap): Domain[] {
  if (Object.keys(custom).length === 0) return domains;
  return domains.map((domain) => {
    const domainCustom = custom[domain.id];
    if (!domainCustom) return domain;
    return {
      ...domain,
      topics: domain.topics.map((topic) => {
        const extra = domainCustom[topic.id];
        if (!extra || extra.length === 0) return topic;
        return {
          ...topic,
          resources: [...topic.resources, ...extra.map((r) => ({ ...r, custom: true }))],
        };
      }),
    };
  });
}

export function filterOutDiscarded(
  domains: Domain[],
  discarded: ReadonlySet<string>
): Domain[] {
  if (discarded.size === 0) return domains;
  return domains.map((domain) => ({
    ...domain,
    topics: domain.topics.map((topic) => ({
      ...topic,
      resources: topic.resources.filter(
        (resource) => !discarded.has(resourceKey(domain.id, topic.id, resource))
      ),
    })),
  }));
}

export function getAllResources(domains: Domain[]): ResourceWithContext[] {
  return domains.flatMap((domain) =>
    domain.topics.flatMap((topic) =>
      topic.resources.map((resource) => ({
        ...resource,
        domainId: domain.id,
        domainName: domain.name,
        topicId: topic.id,
        topicTitle: topic.title,
      }))
    )
  );
}

/**
 * Returns at most one resource per topic: the first one (in the topic's own
 * array order) that isn't checked off yet. This is the eligible-to-suggest
 * pool for What's Next / the Weekly Plan — a later resource in a topic (e.g.
 * "Lesson 4") is never eligible while an earlier one in that same topic
 * (e.g. "Lesson 1") is still unchecked.
 */
export function getNextResources(
  domains: Domain[],
  completed: ReadonlySet<string>
): ResourceWithContext[] {
  const result: ResourceWithContext[] = [];
  for (const domain of domains) {
    for (const topic of domain.topics) {
      const next = topic.resources.find(
        (resource) => !completed.has(resourceKey(domain.id, topic.id, resource))
      );
      if (next) {
        result.push({
          ...next,
          domainId: domain.id,
          domainName: domain.name,
          topicId: topic.id,
          topicTitle: topic.title,
        });
      }
    }
  }
  return result;
}

export interface CompletedResource extends ResourceWithContext {
  completedAt: string;
}

export function getResourcesCompletedSince(
  domains: Domain[],
  timestamps: Readonly<Record<string, string>>,
  sinceDateStr: string
): CompletedResource[] {
  return getAllResources(domains)
    .map((resource) => {
      const key = resourceKey(resource.domainId, resource.topicId, resource);
      const completedAt = timestamps[key];
      return completedAt ? { ...resource, completedAt } : null;
    })
    .filter((resource): resource is CompletedResource => resource !== null && resource.completedAt >= sinceDateStr)
    .sort((a, b) => (a.completedAt < b.completedAt ? 1 : -1));
}
