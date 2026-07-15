import { getDomains } from "@/lib/curriculum";
import CurriculumList from "@/components/CurriculumList";
import PageHeader from "@/components/PageHeader";

export const metadata = {
  title: "Curriculum — Polymath Hub",
};

export default function CurriculumPage() {
  const domains = getDomains();

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow="Domains of Study"
        title="The Curriculum"
        description="Every domain you're building competence in. Check off resources on a domain page as you complete them — progress here updates automatically."
      />
      <CurriculumList domains={domains} />
    </div>
  );
}
