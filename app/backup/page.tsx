import BackupTools from "@/components/BackupTools";
import PageHeader from "@/components/PageHeader";

export const metadata = {
  title: "Backup — Polymath Hub",
};

export default function BackupPage() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow="Your Data"
        title="Backup"
        description="Curriculum progress and habit streaks live in this browser's local storage — they don't sync anywhere on their own. Export a backup file periodically, or before switching browsers or devices, and import it to restore."
        ornament={false}
      />
      <BackupTools />
    </div>
  );
}
