export default function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-sm border border-border bg-surface">
      <div
        className="h-full bg-gradient-to-r from-gold-dim to-gold shadow-[0_0_8px_rgba(198,161,91,0.55)] transition-[width] duration-500"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
