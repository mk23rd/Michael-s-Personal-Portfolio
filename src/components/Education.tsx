
import { Award, BookOpen, Briefcase, GraduationCap } from "lucide-react";
import AnimatedSection from "./AnimatedSection";
import EducationItem from "./EducationItem";

const Education = () => {
  // Timeline entries mix academic milestones, internships, and certifications.
  const educationData = [
    {
      period: "2021 - October 2025",
      degree: "Bachelor of Science in Computer Science",
      institution: "Hilcoe School Of Computer Science And Technology",
      description: "Studied advanced algorithms, software engineering, and artificial intelligence. Participating in hackathons and research projects focused on machine learning applications.",
      icon: <GraduationCap size={24} />
    },
    {
      period: "March 2025 - May 2025",
      degree: "UI/UX Design Internship",
      institution: "YeMuyaWeg - የሙያ ወግ",
      description: "Supported designers with user research, wireframing, and prototyping to deliver intuitive mobile-first experiences.",
      icon: <Briefcase size={24} />
    },
    {
      period: "October 2025",
      degree: "AWS Certified Solutions Architect – Associate",
      institution: "Amazon Web Services",
      description: "Validated ability to design resilient, cost-optimized AWS architectures covering security, migrations, and scalability decisions.",
      icon: <BookOpen size={24} />
    },
    {
      period: "July 2025",
      degree: "AWS Certified Cloud Practitioner",
      institution: "Amazon Web Services",
      description: "Demonstrated core knowledge of AWS cloud concepts, services, billing models, and architectural best practices.",
      icon: <BookOpen size={24} />
    },
    {
      period: "April 2025",
      degree: "Professional Foundation Certificate From ALX Ethiopia",
      institution: "Professional Development Program",
      description: "Completed an intensive program focused on teamwork, communication, and workplace professionalism.",
      icon: <Award size={24} />
    },
    {
      period: "2024",
      degree: "Duolingo English Test – Advanced Proficiency",
      institution: "Duolingo",
      description: "Achieved advanced proficiency across speaking, writing, reading, and listening in English communication.",
      icon: <Award size={24} />
    },
    {
      period: "2020",
      degree: "High School Diploma",
      institution: "Ethio Parent's School",
      description: "Graduated with a 521 Score on my 12th Gade National Examination.",
      icon: <Award size={24} />
    }
  ];

  return (
    <AnimatedSection id="education" className="py-24 relative">
      <div className="section-container">
        <div className="text-center mb-16">
          <span className="text-sm font-medium px-3 py-1 rounded-full bg-secondary text-foreground/80 inline-block mb-4">
            My Journey
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Education & <span className="text-gradient">Experience</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A timeline of my academic achievements and professional experiences.
          </p>
        </div>
        
        {/* Each EducationItem handles icon + description layout. */}
        <div className="max-w-3xl mx-auto">
          {educationData.map((item, index) => (
            <EducationItem
              key={index}
              period={item.period}
              degree={item.degree}
              institution={item.institution}
              description={item.description}
              icon={item.icon}
            />
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
};

export default Education;
