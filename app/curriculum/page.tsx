import { getDomains } from "@/lib/curriculum";
import CurriculumList from "@/components/CurriculumList";
import Ornament from "@/components/Ornament";

export const metadata = {
  title: "Curriculum — Polymath Hub",
};

export default function CurriculumPage() {
  const domains = getDomains();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Domains of Study
        </p>
        <h1 className="font-display mt-2 text-3xl italic text-foreground">
          The Curriculum
        </h1>
        <p className="mt-2 text-sm text-muted">
          Every domain you&apos;re building competence in. Check off resources on a
          domain page as you complete them — progress here updates automatically.
        </p>
      </div>
      <Ornament />
      <CurriculumList domains={domains} />
    </div>
  );
}
