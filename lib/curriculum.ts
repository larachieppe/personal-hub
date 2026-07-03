import curriculumData from "@/data/curriculum.json";

export type TopicStatus = "not-started" | "in-progress" | "done";

export type ResourceType = "book" | "course" | "video" | "article" | "paper" | "other";

export interface Resource {
  title: string;
  url: string;
  type: ResourceType;
}

export interface Topic {
  id: string;
  title: string;
  status: TopicStatus;
  resources: Resource[];
  notes?: string;
}

export interface Domain {
  id: string;
  name: string;
  description: string;
  topics: Topic[];
}

export interface DomainProgress {
  total: number;
  done: number;
  inProgress: number;
  notStarted: number;
  percentDone: number;
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

export function computeDomainProgress(domain: Domain): DomainProgress {
  const total = domain.topics.length;
  const done = domain.topics.filter((t) => t.status === "done").length;
  const inProgress = domain.topics.filter((t) => t.status === "in-progress").length;
  const notStarted = total - done - inProgress;
  const percentDone = total === 0 ? 0 : Math.round((done / total) * 100);
  return { total, done, inProgress, notStarted, percentDone };
}

export function computeOverallProgress(domains: Domain[]): DomainProgress {
  const allTopics = domains.flatMap((d) => d.topics);
  const total = allTopics.length;
  const done = allTopics.filter((t) => t.status === "done").length;
  const inProgress = allTopics.filter((t) => t.status === "in-progress").length;
  const notStarted = total - done - inProgress;
  const percentDone = total === 0 ? 0 : Math.round((done / total) * 100);
  return { total, done, inProgress, notStarted, percentDone };
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
