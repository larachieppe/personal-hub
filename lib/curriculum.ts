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
  percentProgress: number;
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

function summarizeTopics(topics: Topic[]): DomainProgress {
  const total = topics.length;
  const done = topics.filter((t) => t.status === "done").length;
  const inProgress = topics.filter((t) => t.status === "in-progress").length;
  const notStarted = total - done - inProgress;
  const percentDone = total === 0 ? 0 : Math.round((done / total) * 100);
  const percentProgress =
    total === 0 ? 0 : Math.round(((done + inProgress * 0.5) / total) * 100);
  return { total, done, inProgress, notStarted, percentDone, percentProgress };
}

export function computeDomainProgress(domain: Domain): DomainProgress {
  return summarizeTopics(domain.topics);
}

export function computeOverallProgress(domains: Domain[]): DomainProgress {
  return summarizeTopics(domains.flatMap((d) => d.topics));
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
