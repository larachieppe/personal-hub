import { getDomains, getAllResources } from "@/lib/curriculum";
import ResourceLibrary from "@/components/ResourceLibrary";

export const metadata = {
  title: "Athenaeum — Polymath Hub",
};

export default function ResourcesPage() {
  const domains = getDomains();
  const resources = getAllResources(domains);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          The Library
        </p>
        <h1 className="font-display mt-2 text-3xl italic text-foreground">
          The Athenaeum
        </h1>
        <p className="mt-2 text-sm text-muted">
          Every book, course, video, and article attached to a curriculum topic. Add
          more by editing the{" "}
          <code className="border border-border bg-surface px-1 py-0.5 text-foreground">
            resources
          </code>{" "}
          array for any topic in{" "}
          <code className="border border-border bg-surface px-1 py-0.5 text-foreground">
            data/curriculum.json
          </code>
          .
        </p>
      </div>
      <ResourceLibrary resources={resources} />
    </div>
  );
}
