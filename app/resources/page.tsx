import { getDomains } from "@/lib/curriculum";
import ResourceLibrary from "@/components/ResourceLibrary";
import Ornament from "@/components/Ornament";

export const metadata = {
  title: "Athenaeum — Polymath Hub",
};

export default function ResourcesPage() {
  const domains = getDomains();

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
          your own from any domain&apos;s page — no file editing required.
        </p>
      </div>
      <Ornament />
      <ResourceLibrary domains={domains} />
    </div>
  );
}
