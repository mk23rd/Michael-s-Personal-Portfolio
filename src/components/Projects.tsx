import { ArrowUpRight } from "lucide-react";
import { profile, projects } from "@/data/portfolio";
import ProjectCard from "./ProjectCard";
import SectionHeading from "./SectionHeading";

const Projects = () => (
  <section id="work" className="section">
    <div className="wrap">
      <SectionHeading
        label="Selected work"
        aside={`${projects.length} projects`}
        title="Five projects, five different problems."
        intro="A crowdfunding platform that scores risk, a leather-goods storefront, a meal-kit service, a translator that understands context and a Prolog advisor. Each one is on GitHub; the automation work I do at MMCY lives in the next section."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
        {projects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} featured={index === 0} />
        ))}
      </div>

      <p className="mt-10 text-muted-foreground" data-reveal>
        More experiments and coursework live on{" "}
        <a
          href={profile.github}
          target="_blank"
          rel="noreferrer"
          className="link-line inline-flex items-center gap-1 text-foreground"
        >
          GitHub
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>
        .
      </p>
    </div>
  </section>
);

export default Projects;
