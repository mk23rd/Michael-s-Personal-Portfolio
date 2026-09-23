import type { Project } from "@/data/portfolio";
import { cn } from "@/lib/utils";
import Picture from "./Picture";

type ProjectArtworkProps = {
  project: Project;
  variant: "deck" | "card";
  loading?: "eager" | "lazy";
  /** Rendered width of a card screenshot (srcset `sizes`); the deck knows its own. */
  sizes?: string;
};

// The deck card is clamp(9.5rem, 7rem + 9vw, 14rem) wide and the shot spans 94% of it.
const DECK_SIZES = "(min-width: 78rem) 13.2rem, (min-width: 28rem) calc(6.6rem + 8.5vw), 9rem";
// A work card is half of an 85rem wrap from md up; the featured one gets the whole row on lg.
const CARD_SIZES = "(min-width: 85rem) 40rem, (min-width: 48rem) 46vw, 92vw";

/**
 * The visual for a project: a screenshot where one exists, otherwise a small
 * terminal transcript in the project's own language. Shared by the hero deck
 * and the work grid so both tell the same story.
 */
const ProjectArtwork = ({ project, variant, loading = "lazy", sizes = CARD_SIZES }: ProjectArtworkProps) => {
  if (project.image) {
    const img = (
      <Picture
        name={project.image}
        sizes={variant === "deck" ? DECK_SIZES : sizes}
        alt={variant === "deck" ? "" : project.imageAlt ?? ""}
        loading={loading}
        decoding="async"
        className={cn(variant === "card" && project.fit === "art" && "art")}
      />
    );
    return variant === "deck" ? <div className="deck-card-shot">{img}</div> : img;
  }

  const isDeck = variant === "deck";
  const panelClass = isDeck ? "deck-card-shot is-panel" : "work-panel";

  if (project.panel === "translator") {
    return (
      <div className={panelClass} aria-hidden="true">
        <span className="dim">$ </span>translate --to am
        {"\n"}
        <span className="dim">&gt; </span>Good morning, how are you?
        {"\n"}
        <span className="ok">ጤና ይስጥልኝ፣ እንደምን አደርክ?</span>
        {"\n"}
        {!isDeck && (
          <>
            <span className="dim">detected </span>en <span className="dim">→ </span>am{"\n"}
            <span className="dim">context </span>greeting, formal
          </>
        )}
      </div>
    );
  }

  return (
    <div className={panelClass} aria-hidden="true">
      <span className="dim">?- </span>advise(student(cs, year_3), Course).
      {"\n"}
      <span className="hi">Course</span> = machine_learning <span className="dim">;</span>
      {"\n"}
      <span className="hi">Course</span> = distributed_systems <span className="dim">;</span>
      {"\n"}
      {!isDeck && (
        <>
          <span className="hi">Course</span> = compilers <span className="dim">;</span>
          {"\n"}
          <span className="ok">true.</span>
        </>
      )}
    </div>
  );
};

export default ProjectArtwork;
