import { stack } from "@/data/portfolio";

const Track = ({ hidden = false }: { hidden?: boolean }) => (
  <ul className="ticker-track items-center" aria-hidden={hidden || undefined}>
    {stack.map((item) => (
      <li key={item} className="display flex items-center gap-12 text-2xl text-muted-foreground md:text-4xl">
        {item}
        <span className="h-1.5 w-1.5 rounded-full bg-border" aria-hidden="true" />
      </li>
    ))}
  </ul>
);

/** A slow ticker of the tools in daily use; pauses on hover and lays flat under reduced motion. */
const StackStrip = () => (
  <section className="border-y border-border py-8 md:py-10" aria-label="Technologies I work with">
    <div className="ticker">
      <Track />
      <Track hidden />
    </div>
  </section>
);

export default StackStrip;
