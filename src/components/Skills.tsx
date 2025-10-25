
import { Cloud, Code, Layout, Lightbulb, Monitor, Server } from "lucide-react";
import AnimatedSection from "./AnimatedSection";
import SkillCard from "./SkillCard";

const Skills = () => {
  // High-level capabilities shown as cards above the proficiency bars.
  const skillsData = [
    {
      icon: <Code size={24} />,
      title: "Web Development",
      description: "Building responsive websites with modern JavaScript frameworks including React, Vue, and Angular.",
      delay: 100
    },
    {
      icon: <Layout size={24} />,
      title: "UI/UX Design",
      description: "Creating intuitive user interfaces and experiences with Figma, Adobe XD, and design systems.",
      delay: 200
    },
    {
      icon: <Monitor size={24} />,
      title: "Backend Development",
      description: "Developing server-side applications using Node.js, Express, and database technologies.",
      delay: 300
    },
    {
      icon: <Lightbulb size={24} />,
      title: "Problem Solving",
      description: "Applying critical thinking and analytical skills to create effective solutions to complex problems.",
      delay: 400
    },
    {
      icon: <Server size={24} />,
      title: "DevOps",
      description: "Automating workflows with CI/CD pipelines, containerization, and infrastructure-as-code practices.",
      delay: 500
    },
    {
      icon: <Cloud size={24} />,
      title: "AWS Cloud",
      description: "Designing scalable, secure architectures leveraging core AWS services for deployment and monitoring.",
      delay: 600
    }
  ];

  // Percentage values feed into animated progress bars for quick scanning.
  const technicalSkills = [
    { name: "JavaScript", proficiency: 60 },
    { name: "React", proficiency: 60 },
    { name: "TypeScript", proficiency: 70 },
    { name: "Node.js", proficiency: 50 },
    { name: "HTML/CSS", proficiency: 95 },
    { name: "Figma", proficiency: 95 },
    { name: "SQL", proficiency: 80 },
    { name: "Python", proficiency: 65 },
    { name: "DevOps", proficiency: 55 },
    { name: "AWS", proficiency: 75 }
  ];

  return (
    <AnimatedSection id="skills" className="py-24 bg-secondary/50">
      <div className="section-container">
        <div className="text-center mb-16">
          <span className="text-sm font-medium px-3 py-1 rounded-full bg-secondary text-foreground/80 inline-block mb-4 dark:bg-secondary/60">
            My Skills
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Professional <span className="text-gradient">Skillset</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A comprehensive overview of my technical capabilities and specialized areas of expertise.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {skillsData.map((skill, index) => (
            <SkillCard
              key={index}
              icon={skill.icon}
              title={skill.title}
              description={skill.description}
              delay={skill.delay}
            />
          ))}
        </div>
        
        <div className="glass-card rounded-2xl p-8 animate-on-scroll">
          <h3 className="text-xl font-bold mb-6">Technical Skills</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {technicalSkills.map((skill, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-sm text-muted-foreground">{skill.proficiency}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transform transition-all duration-1000 ease-out animate-on-scroll"
                    style={{ 
                      width: `${skill.proficiency}%`,
                      transitionDelay: `${index * 100 + 300}ms`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default Skills;
