
import { ReactNode } from "react";

interface EducationItemProps {
  period: string;
  degree: string;
  institution: string;
  description: string;
  icon: ReactNode;
}

const EducationItem = ({
  period,
  degree,
  institution,
  description,
  icon
}: EducationItemProps) => {
  return (
    <div className="flex gap-6 animate-on-scroll">
      <div className="relative flex flex-col items-center">
        <div className="p-2 rounded-full bg-secondary text-primary shrink-0 z-10">
          {icon}
        </div>
        <div className="w-px h-full bg-border absolute top-12 left-1/2 transform -translate-x-1/2"></div>
      </div>
      
      <div className="pb-12">
        <span className="text-sm font-medium text-muted-foreground block mb-1">
          {period}
        </span>
        <h3 className="text-xl font-bold mb-1">{degree}</h3>
        <p className="text-primary/80 font-medium mb-2">{institution}</p>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default EducationItem;
