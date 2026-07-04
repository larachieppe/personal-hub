import motivation from "@/data/motivation.json";
import { getDomains } from "@/lib/curriculum";
import QuoteOfDay from "@/components/QuoteOfDay";
import DaysCounter from "@/components/DaysCounter";
import HomeDashboard from "@/components/HomeDashboard";

export default function Home() {
  const domains = getDomains();

  return (
    <div className="flex flex-col gap-14">
      <section className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            The Pursuit
          </p>
          <DaysCounter />
        </div>
        <h1 className="font-display text-3xl italic leading-snug text-foreground first-letter:mr-1 first-letter:float-left first-letter:font-display first-letter:text-6xl first-letter:not-italic first-letter:text-gold sm:text-4xl">
          {motivation.mission}
        </h1>
        <QuoteOfDay />
      </section>

      <HomeDashboard domains={domains} />
    </div>
  );
}
