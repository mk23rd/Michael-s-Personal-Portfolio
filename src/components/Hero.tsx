
import { useState } from "react";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Hero = () => {
  const [imageSrc, setImageSrc] = useState("/IMG_2653.jpg");

  return (
    <section 
      id="home" 
      className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[30%] -right-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 blur-3xl opacity-70 dark:from-indigo-900/40 dark:to-slate-900/30"></div>
        <div className="absolute -bottom-[30%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-tr from-blue-50 to-indigo-100 blur-3xl opacity-70 dark:from-indigo-900/40 dark:to-slate-900/30"></div>
      </div>
      <div className="section-container relative flex flex-col items-center justify-center gap-12 pb-24 text-center md:flex-row md:items-center md:gap-16 md:text-left">
        <div className="order-2 flex max-w-3xl flex-col items-center space-y-6 md:order-1 md:items-start">
          <div className="relative overflow-hidden">
            <span className="inline-block text-sm font-medium px-3 py-1 rounded-full bg-secondary text-foreground/80 animate-fade-in">
              Hi, I'm Michael
            </span>
          </div>

          <div className="space-y-6">
            <div className="overflow-hidden">
              <h1
                className={cn(
                  "text-4xl font-display font-bold tracking-tight animate-text-reveal opacity-0",
                  "md:text-6xl lg:text-7xl reveal-delay-1"
                )}
              >
                Recent <span className="text-gradient">Graduate</span> From Hilcoe School Of Computer Science And Technology
              </h1>
              <br />
            </div>

            <div className="overflow-hidden">
              <div
                className={cn(
                  "space-y-4 text-lg text-muted-foreground animate-text-reveal opacity-0",
                  "md:text-xl reveal-delay-2"
                )}
              >
                <p>
                  Hi, I’m Michael — a recent graduate passionate about solving real-world problems through code and cloud technologies.
                </p>
                <p>
                  Over the past four years, I’ve built a solid foundation in software development, data structures, and systems design. I’m AWS Cloud Practitioner certified and currently working toward the Solutions Architect certification to deepen my cloud architecture skills.
                </p>
                <p>
                  I thrive on curiosity, determination, and a strong "get things done" mindset. Whether I’m learning a new framework, debugging complex code, or collaborating with teammates, I stay focused on delivering quality results.
                </p>
                <p>
                  I’m especially interested in opportunities that let me grow as a software developer—internships, junior roles, or collaborative tech projects. If you’re looking for someone motivated and ready to tackle new challenges, let’s connect!
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 pt-4 sm:flex-row md:items-start">
              <a
                href="#projects"
                className={cn(
                  "px-6 py-3 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-all",
                  "transform hover:-translate-y-0.5 hover:shadow-lg",
                  "animate-fade-in opacity-0 reveal-delay-3"
                )}
              >
                View Projects
              </a>
              <a
                href="#contact"
                className={cn(
                  "px-6 py-3 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all",
                  "transform hover:-translate-y-0.5",
                  "animate-fade-in opacity-0 reveal-delay-4"
                )}
              >
                Contact Me
              </a>
            </div>
          </div>
        </div>

        <div className="order-1 md:order-2">
          <div
            className={cn(
              "relative mx-auto h-48 w-48 overflow-hidden rounded-full border border-border/40 bg-gradient-to-tr from-primary/15 via-blue-500/10 to-purple-500/20 shadow-xl",
              "sm:h-56 sm:w-56 md:h-64 md:w-64"
            )}
          >
            <div className="absolute inset-0 -z-10 animate-pulse rounded-full bg-gradient-to-br from-primary/20 via-sky-400/15 to-indigo-500/20" aria-hidden="true" />
            <img
              src={imageSrc}
              onError={() => setImageSrc("/placeholder.svg")}
              alt="Portrait of Michael"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      <a 
        href="#projects" 
        className={cn(
          "absolute bottom-10 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-border",
          "bg-background/80 backdrop-blur-sm animate-floating"
        )}
        aria-label="Scroll down"
      >
        <ArrowDown size={20} className="text-muted-foreground" />
      </a>
    </section>
  );
};

export default Hero;
