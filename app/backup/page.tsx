import BackupTools from "@/components/BackupTools";

export const metadata = {
  title: "Backup — Polymath Hub",
};

export default function BackupPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Your Data
        </p>
        <h1 className="font-display mt-2 text-3xl italic text-foreground">
          Backup
        </h1>
        <p className="mt-2 text-sm text-muted">
          Curriculum progress and habit streaks live in this browser&apos;s local storage —
          they don&apos;t sync anywhere on their own. Export a backup file periodically, or
          before switching browsers or devices, and import it to restore.
        </p>
      </div>
      <BackupTools />
    </div>
  );
}
