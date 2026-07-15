import { getDomains } from "@/lib/curriculum";
import ResourceLibrary from "@/components/ResourceLibrary";
import PageHeader from "@/components/PageHeader";

export const metadata = {
  title: "Athenaeum — Polymath Hub",
};

export default function ResourcesPage() {
  const domains = getDomains();

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow="The Library"
        title="The Athenaeum"
        description="Every book, course, video, and article attached to a curriculum topic. Add your own from any domain's page — no file editing required."
      />
      <ResourceLibrary domains={domains} />
    </div>
  );
}
