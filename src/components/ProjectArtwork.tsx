import type { Project } from "@/data/portfolio";
import { cn } from "@/lib/utils";

type ProjectArtworkProps = {
  project: Project;
  variant: "deck" | "card";
  loading?: "eager" | "lazy";
};

/**
 * The visual for a project: a screenshot where one exists, otherwise a small
 * terminal transcript in the project's own language. Shared by the hero deck
 * and the work grid so both tell the same story.
 */
const ProjectArtwork = ({ project, variant, loading = "lazy" }: ProjectArtworkProps) => {
  if (project.image) {
    const img = (
      <img
        src={project.image}
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
