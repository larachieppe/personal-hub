import Pantry from "@/components/Pantry";
import Ornament from "@/components/Ornament";

export const metadata = {
  title: "Pantry — Polymath Hub",
};

export default function PantryPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Daily Practice
        </p>
        <h1 className="font-display mt-2 text-3xl italic text-foreground">
          Pantry
        </h1>
        <p className="mt-2 text-sm text-muted">
          Check off what you currently have stocked — anything unchecked is what to
          pick up on the next grocery run. Click{" "}
          <span className="text-gold">Edit pantry</span> to rename items, add new
          ones, or remove what you don&apos;t need to track.
        </p>
      </div>
      <Ornament />
      <Pantry />
    </div>
  );
}
