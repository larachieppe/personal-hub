import curriculumData from "@/data/curriculum.json";

export type TopicStatus = "not-started" | "in-progress" | "done";

export type ResourceType = "book" | "video" | "article" | "paper" | "other";

export interface Resource {
  title: string;
  url: string;
  type: ResourceType;
  custom?: boolean;
}

export interface CourseSection {
  title: string;
  url: string;
}

/**
 * A multi-part course (Google's ML Crash Course, fast.ai, a CMU lecture
 * series, etc.) — one entity with its own title, plus an ordered list of
 * sections that are each individually checkable. `sectionType` describes
 * what every section is (they're almost always homogeneous: all video, or
 * all article-like pages), shown as that section's type badge.
 */
export interface Course {
  title: string;
  type: "course";
  sectionType: ResourceType;
  sections: CourseSection[];
  custom?: boolean;
}

export type TopicItem = Resource | Course;

export function isCourse(item: TopicItem): item is Course {
  return item.type === "course";
}

export interface Topic {
  id: string;
  title: string;
  resources: TopicItem[];
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

export interface CourseProgress {
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
  key: string;
  courseTitle?: string;
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

export function resourceKey(domainId: string, topicId: string, resource: { title: string }): string {
  return `${domainId}/${topicId}/${slugify(resource.title)}`;
}

export function sectionKey(
  domainId: string,
  topicId: string,
  course: { title: string },
  section: { title: string }
): string {
  return `${domainId}/${topicId}/${slugify(course.title)}--${slugify(section.title)}`;
}

interface FlatItem {
  key: string;
  title: string;
  url: string;
  type: ResourceType;
  custom?: boolean;
  courseTitle?: string;
}

/**
 * Expands a topic's items — flat resources and course sections alike —
 * into one ordered, flat list. This is the single place that understands
 * the Resource/Course union; everything downstream (progress, sequencing,
 * discarding) works off this flat view so a course's sections behave
 * exactly like standalone resources wherever they end up in the sequence.
 */
function flattenTopicItems(domainId: string, topicId: string, items: TopicItem[]): FlatItem[] {
  const result: FlatItem[] = [];
  for (const item of items) {
    if (isCourse(item)) {
      for (const section of item.sections) {
        result.push({
          key: sectionKey(domainId, topicId, item, section),
          title: section.title,
          url: section.url,
          type: item.sectionType,
          custom: item.custom,
          courseTitle: item.title,
        });
      }
    } else {
      result.push({
        key: resourceKey(domainId, topicId, item),
        title: item.title,
        url: item.url,
        type: item.type,
        custom: item.custom,
      });
    }
  }
  return result;
}

export function computeTopicProgress(
  domainId: string,
  topic: Topic,
  completed: ReadonlySet<string>
): TopicProgress {
  const flat = flattenTopicItems(domainId, topic.id, topic.resources);
  const total = flat.length;
  const checked = flat.filter((item) => completed.has(item.key)).length;
  const status: TopicStatus =
    total === 0 || checked === 0 ? "not-started" : checked === total ? "done" : "in-progress";
  return { status, total, checked };
}

export function computeCourseProgress(
  domainId: string,
  topicId: string,
  course: Course,
  completed: ReadonlySet<string>
): CourseProgress {
  const total = course.sections.length;
  const checked = course.sections.filter((section) =>
    completed.has(sectionKey(domainId, topicId, course, section))
  ).length;
  return { total, checked };
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
 * the usual Discard. Custom resources are always flat (never a Course).
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
      resources: topic.resources
        .map((item): TopicItem | null => {
          if (isCourse(item)) {
            const sections = item.sections.filter(
              (section) => !discarded.has(sectionKey(domain.id, topic.id, item, section))
            );
            return sections.length === 0 ? null : { ...item, sections };
          }
          return discarded.has(resourceKey(domain.id, topic.id, item)) ? null : item;
        })
        .filter((item): item is TopicItem => item !== null),
    })),
  }));
}

export function getAllResources(domains: Domain[]): ResourceWithContext[] {
  return domains.flatMap((domain) =>
    domain.topics.flatMap((topic) =>
      flattenTopicItems(domain.id, topic.id, topic.resources).map((item) => ({
        key: item.key,
        title: item.title,
        url: item.url,
        type: item.type,
        custom: item.custom,
        courseTitle: item.courseTitle,
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
 * flattened order — flat resources and course sections alike) that isn't
 * checked off yet. This is the eligible-to-suggest pool for What's Next /
 * the Weekly Plan — a later resource or course section is never eligible
 * while an earlier one in that same topic is still unchecked.
 */
export function getNextResources(
  domains: Domain[],
  completed: ReadonlySet<string>
): ResourceWithContext[] {
  const result: ResourceWithContext[] = [];
  for (const domain of domains) {
    for (const topic of domain.topics) {
      const flat = flattenTopicItems(domain.id, topic.id, topic.resources);
      const next = flat.find((item) => !completed.has(item.key));
      if (next) {
        result.push({
          key: next.key,
          title: next.title,
          url: next.url,
          type: next.type,
          custom: next.custom,
          courseTitle: next.courseTitle,
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
      const completedAt = timestamps[resource.key];
      return completedAt ? { ...resource, completedAt } : null;
    })
    .filter((resource): resource is CompletedResource => resource !== null && resource.completedAt >= sinceDateStr)
    .sort((a, b) => (a.completedAt < b.completedAt ? 1 : -1));
}
