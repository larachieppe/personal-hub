export default function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-sm border border-border bg-surface">
      <div
        className="h-full bg-gradient-to-r from-gold-dim to-gold transition-[width]"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
