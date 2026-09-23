import { ArrowUpRight, Github, Globe } from "lucide-react";
import type { Project } from "@/data/portfolio";
import { cn, vars } from "@/lib/utils";
import ProjectArtwork from "./ProjectArtwork";

type ProjectCardProps = {
  project: Project;
  featured?: boolean;
  index: number;
};

const ProjectCard = ({ project, featured = false, index }: ProjectCardProps) => (
  <div
    className={cn("scroll-mt-28", featured && "lg:col-span-2")}
    id={project.id}
    data-reveal
    style={vars({ "--reveal-delay": `${(index % 2) * 90}ms` })}
  >
    <article className="work h-full">
      <div
        className={cn("work-media", featured && "wide")}
        style={vars({ "--card-brand": project.brand, "--card-ink": project.ink })}
      >
        <div className="absolute left-6 top-5 flex items-center gap-3 text-sm sm:left-8 sm:top-7">
          <span className="opacity-90">{project.kind}</span>
          <span className="opacity-60">{project.year}</span>
        </div>
        <ProjectArtwork
          project={project}
          variant="card"
          sizes={featured ? "(min-width: 85rem) 63rem, (min-width: 64rem) 72vw, (min-width: 48rem) 46vw, 92vw" : undefined}
        />
      </div>

      <div className="flex flex-col gap-5 p-6 sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h3 className="display h3">{project.title}</h3>
          <p className="text-muted-foreground">{project.summary}</p>
        </div>
        <p className={cn("text-muted-foreground", featured && "lg:max-w-[60ch]")}>{project.description}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-1">
          <ul className="flex flex-wrap gap-2" aria-label="Built with">
            {project.stack.map((tool) => (
              <li key={tool} className="tag">
                {tool}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-5">
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noreferrer"
                className="link-line group inline-flex items-center gap-1.5 text-sm font-medium"
                aria-label={`${project.title} live site`}
              >
                <Globe size={16} aria-hidden="true" />
                Live site
                <ArrowUpRight
                  size={16}
                  aria-hidden="true"
                  className="transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>
            )}
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              className="link-line group inline-flex items-center gap-1.5 text-sm font-medium"
              aria-label={`${project.title} source code on GitHub`}
            >
              <Github size={16} aria-hidden="true" />
              Source
              <ArrowUpRight
                size={16}
                aria-hidden="true"
                className="transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          </div>
        </div>
      </div>
    </article>
  </div>
);

export default ProjectCard;
