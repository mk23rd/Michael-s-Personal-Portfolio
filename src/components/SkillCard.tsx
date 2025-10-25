
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SkillCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  delay?: number;
}

const SkillCard = ({ icon, title, description, delay = 0 }: SkillCardProps) => {
  return (
    <div 
      className={cn(
        "rounded-2xl glass-card p-6 animated-card",
        "animate-on-scroll"
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="p-3 bg-secondary inline-block rounded-xl mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
};

export default SkillCard;
