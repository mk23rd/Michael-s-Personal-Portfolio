
import { useState } from "react";
import { ExternalLink, GithubIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Project card props describe the information shown for each portfolio item.
 *
 * Notes:
 * - `image` and `video` are optional; the component prefers video when provided.
 * - `index` is used to stagger animation timing in lists.
 */
interface ProjectCardProps {
  title: string;
  description: string;
  image?: string;
  video?: string;
  tags: string[];
  liveUrl?: string;
  githubUrl?: string;
  index: number;
}

// Presentational card used by the Projects grid with hover animation + optional links.
const ProjectCard = ({
  title,
  description,
  image,
  video,
  tags,
  liveUrl,
  githubUrl,
  index
}: ProjectCardProps) => {
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const displayImage = image ?? "/placeholder.svg";
  const hasVideo = Boolean(video);

  return (
    <div 
      className={cn(
        "group relative rounded-2xl overflow-hidden animated-card glass-card",
        "animate-on-scroll transform transition-all duration-500",
        index % 2 === 0 ? "translate-y-4" : "translate-y-0"
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="aspect-video overflow-hidden relative">
        <div className={cn(
          "absolute inset-0 bg-gray-100 animate-pulse z-0",
          isMediaLoaded ? "hidden" : "block"
        )} />
        {hasVideo ? (
          <video
            key={video}
            className={cn(
              "relative z-10 h-full w-full object-cover transition-all duration-500 group-hover:scale-105",
              isMediaLoaded ? "opacity-100" : "opacity-0"
            )}
            poster={displayImage}
            muted
            loop
            playsInline
            autoPlay
            controls
            preload="metadata"
            onLoadedData={() => setIsMediaLoaded(true)}
          >
            <source src={video} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src={displayImage}
            alt={title}
            loading="lazy"
            className={cn(
              "relative z-10 h-full w-full object-cover transition-all duration-500 group-hover:scale-105",
              isMediaLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setIsMediaLoaded(true)}
          />
        )}
      </div>
      
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="relative p-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <span 
              key={tag} 
              className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

  <h3 className="text-xl font-bold mb-2 break-words text-foreground">{title}</h3>
        <p className="text-muted-foreground text-sm mb-4">{description}</p>
        
        <div className="flex items-center gap-4 pt-2">
          {liveUrl && (
            <a 
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              <ExternalLink size={16} />
              <span>Live Preview</span>
            </a>
          )}
          
          {githubUrl && (
            <a 
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              <GithubIcon size={16} />
              <span>Source Code</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
