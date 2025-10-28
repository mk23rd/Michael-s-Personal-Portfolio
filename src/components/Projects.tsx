
import AnimatedSection from "./AnimatedSection";
import ProjectCard from "./ProjectCard";

const Projects = () => {
  // Curated list of portfolio highlights; adjust tags to control the pill badges.
  const featuredProjects = [
    {
      title: "Risk_Integrated_Crowdfunding_and_Investment_Platform",
      description: "A modern web application built with React, Vite, and GSAP that helps teams launch transparent, risk-aware crowdfunding campaigns. Final year capstone project with end-to-end investor protection flows.",
      tags: ["React", "Vite", "GSAP", "Firebase"],
      image: "/Lawata.png",
      githubUrl: "https://github.com/mk23rd/Risk_Integrated_Crowdfunding_and_Investment_Platform"
    },
    {
      title: "Synth",
      description: "A modern, responsive e-commerce platform for premium leather products featuring jackets, bags, and belts. Built with HTML, CSS, JavaScript, and PHP with MySQL database integration.",
      tags: ["JavaScript", "PHP", "MySQL"],
      image: "/Synth.png",
      githubUrl: "https://github.com/mk23rd/Synth"
    },
    {
      title: "Fewes",
      description: "Fewes is a modern meal-kit experience for authentic Ethiopian cuisine, covering menu browsing, weekly planning, and subscription management.",
      tags: ["JavaScript", "HTML", "CSS", "jQuery"],
      image: "/Fewes.png",
      githubUrl: "https://github.com/mk23rd/Fewes"
    },
    {
      title: "OpenAI_Translator",
      description: "Python-based translation assistant that integrates OpenAI APIs to translate across multiple languages with contextual accuracy.",
      tags: ["Python", "OpenAI", "CLI"],
      image: "/placeholder.svg",
      video: "/coming soon.mp4",
      githubUrl: "https://github.com/mk23rd/OpenAI_Translator"
    },
    {
      title: "Mini Expert System Using Prolog",
      description: "Academic advisor expert system crafted in Prolog to recommend courses and pathways based on student goals and prerequisites.",
      tags: ["Prolog", "Expert System", "AI"],
      image: "/placeholder.svg",
      video: "/coming soon.mp4",
      githubUrl: "https://github.com/mk23rd/Mini_Expert_System_Prolog"
    }
  ];

  return (
    <AnimatedSection id="projects" className="py-24 relative">
      <div className="section-container">
        <div className="text-center mb-16">
          <span className="text-sm font-medium px-3 py-1 rounded-full bg-secondary text-foreground/80 inline-block mb-4">
            My Work
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Featured <span className="text-gradient">Projects</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore a collection of my recent work showcasing my skills in design, 
            development, and problem-solving across various domains.
          </p>
        </div>
        {/* Responsive grid renders cards with staggered animations handled inside ProjectCard. */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {featuredProjects.map((project, index) => (
            <ProjectCard
              key={project.title}
              title={project.title}
              description={project.description}
              image={project.image}
              video={project.video}
              tags={project.tags}
              githubUrl={project.githubUrl}
              index={index}
            />
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
};

export default Projects;
