import motivation from "@/data/motivation.json";
import { getDomains } from "@/lib/curriculum";
import QuoteOfDay from "@/components/QuoteOfDay";
import DaysCounter from "@/components/DaysCounter";
import HomeDashboard from "@/components/HomeDashboard";

export default function Home() {
  const domains = getDomains();

  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <p className="eyebrow">The Pursuit</p>
          <DaysCounter />
        </div>
        <h1 className="font-display text-4xl italic leading-[1.1] tracking-tight text-foreground first-letter:mr-1 first-letter:float-left first-letter:font-display first-letter:text-7xl first-letter:not-italic first-letter:text-gold sm:text-5xl md:text-6xl">
          {motivation.mission}
        </h1>
        <QuoteOfDay />
      </section>

      <HomeDashboard domains={domains} />
    </div>
  );
}
