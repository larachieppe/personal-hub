import { getDomains, getAllResources } from "@/lib/curriculum";
import ResourceLibrary from "@/components/ResourceLibrary";

export const metadata = {
  title: "Resources — Polymath Hub",
};

export default function ResourcesPage() {
  const domains = getDomains();
  const resources = getAllResources(domains);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Resource library</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Every book, course, video, and article attached to a curriculum topic. Add
          more by editing the <code className="rounded bg-zinc-100 px-1 py-0.5 dark:bg-zinc-800">resources</code> array
          for any topic in{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 dark:bg-zinc-800">
            data/curriculum.json
          </code>
          .
        </p>
      </div>
      <ResourceLibrary resources={resources} />
    </div>
  );
}
