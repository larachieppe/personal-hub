import motivation from "@/data/motivation.json";

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-4xl px-6 py-6 text-center text-xs italic tracking-wide text-muted">
        {motivation.motto}
      </div>
    </footer>
  );
}
