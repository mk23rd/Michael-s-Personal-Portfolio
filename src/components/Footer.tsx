
import { GithubIcon, InstagramIcon, LinkedinIcon, TwitterIcon } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const socialLinks = [
    { name: "GitHub", icon: <GithubIcon size={18} />, url: "https://github.com/mk23rd" },
    { name: "LinkedIn", icon: <LinkedinIcon size={18} />, url: "https://www.linkedin.com/in/michael-wagaye-3362272b0/" },
    { name: "Twitter", icon: <TwitterIcon size={18} />, url: "https://x.com/mk_23rd?s=11" },
    { name: "Instagram", icon: <InstagramIcon size={18} />, url: "https://www.instagram.com/mk_23rd?igsh=d3dsczQ0aGV0M2d2&utm_source=qr" }
  ];

  return (
    <footer className="py-12 border-t border-border bg-background">
      <div className="section-container">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <a href="#home" className="text-xl font-semibold">
              <span className="text-gradient">Michael's Portfolio</span>
            </a>
            <p className="text-muted-foreground mt-2 text-sm">
              Creating digital experiences with passion and purpose.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label={link.name}
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
        
        <div className="border-t border-border/50 mt-8 pt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            © {currentYear} Michael's Portfolio. All rights reserved.
          </div>
          
          <div className="flex flex-wrap gap-6 text-sm">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
