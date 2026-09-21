/**
 * Everything the site says lives here, so copy and links can be edited
 * without touching layout code.
 */

import {
  Activity,
  ArrowRightLeft,
  Boxes,
  BrainCircuit,
  Cloud,
  Code2,
  DatabaseBackup,
  FileClock,
  Github,
  Instagram,
  Linkedin,
  Network,
  Presentation,
  Radar,
  ScrollText,
  ShieldAlert,
  UserCheck,
  X,
  type LucideIcon
} from "lucide-react";

export const profile = {
  name: "Michael Wagaye",
  role: "AI Automation Developer & Cloud Engineer",
  employer: "MMCY",
  status: "Open to new opportunities",
  city: "Addis Ababa",
  country: "Ethiopia",
  timeZone: "Africa/Addis_Ababa",
  email: "michaelofthesith@gmail.com",
  phone: "+251 98 581 7122",
  phoneHref: "tel:+251985817122",
  resume: "/michael-wagaye-resume.pdf",
  portrait: "/portrait.jpg",
  github: "https://github.com/mk23rd"
};

export type Social = { label: string; handle: string; href: string; icon: LucideIcon };

export const socials: Social[] = [
  { label: "GitHub", handle: "mk23rd", href: "https://github.com/mk23rd", icon: Github },
  {
    label: "LinkedIn",
    handle: "michael-wagaye",
    href: "https://www.linkedin.com/in/michael-wagaye-3362272b0/",
    icon: Linkedin
  },
  { label: "X", handle: "mk_23rd", href: "https://x.com/mk_23rd", icon: X },
  { label: "Instagram", handle: "mk_23rd", href: "https://www.instagram.com/mk_23rd", icon: Instagram }
];

export const navigation = [
  { label: "Work", href: "#work" },
  { label: "Automation", href: "#automation" },
  { label: "Services", href: "#services" },
  { label: "Experience", href: "#experience" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" }
];

export type Project = {
  id: string;
  title: string;
  repo: string;
  summary: string;
  description: string;
  stack: string[];
  year: string;
  kind: string;
  github: string;
  brand: string;
  ink: string;
  image?: string;
  imageAlt?: string;
  /** Illustration on a white ground rather than a screenshot; shown whole instead of cropped. */
  fit?: "art";
  panel?: "translator" | "prolog";
};

export const projects: Project[] = [
  {
    id: "lawata",
    title: "Lawata",
    repo: "Risk_Integrated_Crowdfunding_and_Investment_Platform",
    summary: "Risk-aware crowdfunding and investment platform",
    description:
      "Final-year capstone. Campaign creators publish a project, backers see a risk score before they commit, and every investment runs through an end-to-end protection flow. Built with React and Vite on Firebase, with GSAP handling the narrative motion.",
    stack: ["React", "Vite", "Firebase", "GSAP"],
    year: "2025",
    kind: "Capstone",
    github: "https://github.com/mk23rd/Risk_Integrated_Crowdfunding_and_Investment_Platform",
    brand: "#2b63f5",
    ink: "#ffffff",
    image: "/lawata.png",
    imageAlt: "Lawata landing page with the headline 'Create or crowdfund' drawn as candlestick bars",
    fit: "art"
  },
  {
    id: "synth",
    title: "Synth",
    repo: "Synth",
    summary: "Storefront for premium leather goods",
    description:
      "A full e-commerce flow for jackets, bags and belts: catalogue, cart, accounts and checkout. Server-rendered PHP with a MySQL schema designed from scratch, and a hand-written front end with no framework.",
    stack: ["PHP", "MySQL", "JavaScript", "CSS"],
    year: "2024",
    kind: "E-commerce",
    github: "https://github.com/mk23rd/Synth",
    brand: "#6d4842",
    ink: "#f3f0d6",
    image: "/synth.jpg",
    imageAlt: "Synth homepage showing leather bags, belts and a jacket on a brown background"
  },
  {
    id: "fewes",
    title: "Fewes",
    repo: "Fewes",
    summary: "Meal-kit subscriptions for Ethiopian cooking",
    description:
      "Weekly menus of authentic Ethiopian dishes, a planner for the week ahead and subscription management, wrapped in a bright interface with Amharic type. jQuery for the interaction layer, plain HTML and CSS underneath.",
    stack: ["JavaScript", "jQuery", "HTML", "CSS"],
    year: "2024",
    kind: "Web app",
    github: "https://github.com/mk23rd/Fewes",
    brand: "#35c11c",
    ink: "#062b00",
    image: "/fewes.jpg",
    imageAlt: "Fewes homepage with an Amharic headline, a salad bowl and falling spices on green"
  },
  {
    id: "translator",
    title: "OpenAI Translator",
    repo: "OpenAI_Translator",
    summary: "Context-aware translation from the terminal",
    description:
      "A Python command-line assistant that sends text to the OpenAI API with surrounding context so idioms survive the trip between languages. Supports batch files, language detection and a conversational mode.",
    stack: ["Python", "OpenAI API", "CLI"],
    year: "2024",
    kind: "Tool",
    github: "https://github.com/mk23rd/OpenAI_Translator",
    brand: "#0b7a5d",
    ink: "#ffffff",
    panel: "translator"
  },
  {
    id: "prolog",
    title: "Mini expert system",
    repo: "Mini_Expert_System_Prolog",
    summary: "Course advisor written in Prolog",
    description:
      "An academic advisor that recommends courses and study paths from a student's goals and completed prerequisites. Rules, facts and a small inference engine in Prolog, built to understand how expert systems reason.",
    stack: ["Prolog", "Expert systems"],
    year: "2023",
    kind: "Coursework",
    github: "https://github.com/mk23rd/Mini_Expert_System_Prolog",
    brand: "#e9a51a",
    ink: "#1a1200",
    panel: "prolog"
  }
];

export const stack = [
  "Python",
  "PowerShell",
  "Power Automate",
  "AWS",
  "Microsoft 365",
  "Microsoft Graph",
  "SharePoint",
  "Entra ID",
  "Zabbix",
  "Wazuh",
  "Graylog",
  "Power BI",
  "TypeScript",
  "Node.js",
  "React",
  "REST APIs",
  "MySQL",
  "Selenium",
  "Docker",
  "Git"
];

export type Service = { title: string; body: string; tools: string[]; icon: LucideIcon };

export const services: Service[] = [
  {
    title: "AI and workflow automation",
    body: "Python, PowerShell and Power Automate pipelines that take repetitive IT operations off people's plates, and centralise the data so incidents, risks and anomalies can be summarised and acted on faster, with AI where it earns its place.",
    tools: ["Python", "PowerShell", "Power Automate", "Selenium"],
    icon: BrainCircuit
  },
  {
    title: "Cloud and Microsoft 365 engineering",
    body: "AWS on one side, Microsoft 365 on the other: SharePoint, Entra ID and the Graph API, certificate-based authentication, least-privilege access and scheduled workloads in cloud and hybrid environments.",
    tools: ["AWS", "Microsoft 365", "Entra ID", "Graph API"],
    icon: Cloud
  },
  {
    title: "Monitoring, logging and security",
    body: "Zabbix, Wazuh and Graylog wired into Teams and Power BI, so availability, vulnerabilities and log volumes are watched, alerted on and reported without anyone checking a dashboard by hand.",
    tools: ["Zabbix", "Wazuh", "Graylog", "Power BI"],
    icon: Radar
  },
  {
    title: "Full-stack development",
    body: "Node.js and TypeScript services with clear REST contracts, React on the front, MySQL or Firebase underneath, and PHP when the project calls for it.",
    tools: ["Node.js", "TypeScript", "React", "REST"],
    icon: Code2
  },
  {
    title: "Consulting, training and mentoring",
    body: "Requirements discovery, solution design and stakeholder advice, plus a year of teaching young professionals to build, debug and ship real software.",
    tools: ["Discovery", "Solution design", "Training"],
    icon: Presentation
  }
];

export type Automation = {
  title: string;
  tools: string[];
  body: string;
  icon: LucideIcon;
};

/** Selected automation and AI-enabled engineering delivered at MMCY. */
export const automation: Automation[] = [
  {
    title: "Unified endpoint asset and software inventory",
    tools: ["PowerShell", "Microsoft Graph", "SharePoint", "Power BI", "Wazuh"],
    body: "Automated endpoint and software inventory with reconciliation, licence visibility and SharePoint reporting. Structured for AI-assisted anomaly detection and asset-risk scoring.",
    icon: Boxes
  },
  {
    title: "Zabbix WAN, website and infrastructure monitoring",
    tools: ["Zabbix", "Teams", "Power Automate", "APIs"],
    body: "Latency, packet loss, website availability, trigger and recovery tracking, routed into Teams. Normalised alert data feeds incident summarisation and noise reduction.",
    icon: Activity
  },
  {
    title: "Prometheus/Grafana to Zabbix migration",
    tools: ["Zabbix", "Grafana", "Prometheus", "Teams"],
    body: "Moved monitoring logic and alerting onto Zabbix as the single source of truth, validated coverage, cleaned up Teams routing and retired the legacy stack.",
    icon: ArrowRightLeft
  },
  {
    title: "HikCentral configuration backup to SharePoint",
    tools: ["Entra ID", "Certificates", "Graph API", "SharePoint"],
    body: "Unattended configuration backups using certificate-based Entra authentication and least-privilege SharePoint access, with history for change comparison.",
    icon: DatabaseBackup
  },
  {
    title: "Wazuh vulnerability monitoring automation",
    tools: ["Wazuh", "API", "Scheduled scans", "Reporting"],
    body: "Recurring vulnerability scanning and historical endpoint visibility, including offline agents, ready to be prioritised by severity, recurrence and exposure.",
    icon: ShieldAlert
  },
  {
    title: "Graylog logging and monitoring KPIs",
    tools: ["Graylog", "API", "Python"],
    body: "Monthly log-volume, compliance, device-coverage, peak-day and noisiest-device reporting, generated automatically instead of assembled by hand.",
    icon: ScrollText
  },
  {
    title: "Network configuration backup automation",
    tools: ["PowerShell", "Posh-SSH", "SSH/SCP"],
    body: "Recurring configuration backups for network devices with repeatable retention, giving a base for drift detection and configuration review.",
    icon: Network
  },
  {
    title: "Automated IT incident timeline and reporting",
    tools: ["Monitoring APIs", "Power Automate", "Python"],
    body: "Consolidates alert, recovery, duration and supporting events into incident timelines suited to AI-written narratives and post-incident summaries.",
    icon: FileClock
  },
  {
    title: "HR, M365, AD and biometric access reconciliation",
    tools: ["PowerShell", "Microsoft 365", "Active Directory"],
    body: "Cross-system reconciliation that surfaces HR and system mismatches and stale access, structured for risk-based review.",
    icon: UserCheck
  }
];

export const automationMore = [
  "Firmware and licence-expiry monitoring",
  "Raspberry Pi ISP speed-test monitoring",
  "Solar Assistant inverter telemetry alerts",
  "Active Directory user-creation audit",
  "AD computer placement and GPO automation",
  "Weekly change-request summary flow",
  "SSL/TLS certificate monitoring",
  "Internet-facing asset inventory",
  "Server patch-compliance monitoring",
  "HikCentral biometric and IoT device monitoring"
];

export type TimelineKind = "Education" | "Work" | "Certification";

export type TimelineEntry = {
  period: string;
  sortYear: number;
  title: string;
  org: string;
  detail: string;
  kind: TimelineKind;
};

export const timeline: TimelineEntry[] = [
  {
    period: "Dec 2025 – present",
    sortYear: 2026,
    title: "AI Automation Developer & Cloud Engineer",
    org: "MMCY",
    detail:
      "Python, PowerShell, Power Automate and Microsoft 365 automation for IT operations: monitoring, reporting, backups, inventory, alerting and reconciliation, owned from requirements through production support.",
    kind: "Work"
  },
  {
    period: "In progress",
    sortYear: 2025.9,
    title: "AWS Certified Solutions Architect – Professional",
    org: "Amazon Web Services",
    detail: "Currently preparing; builds on the Associate certification with complex, multi-account architectures.",
    kind: "Certification"
  },
  {
    period: "Oct 2025",
    sortYear: 2025.8,
    title: "AWS Certified Solutions Architect – Associate",
    org: "Amazon Web Services",
    detail:
      "Designing resilient, cost-aware architectures: security, migrations and scaling decisions.",
    kind: "Certification"
  },
  {
    period: "May 2021 – Oct 2025",
    sortYear: 2025.7,
    title: "BSc in Computer Science",
    org: "HiLCoE School of Computer Science and Technology",
    detail:
      "Algorithms, software engineering and artificial intelligence, with hackathons and a machine-learning research project along the way.",
    kind: "Education"
  },
  {
    period: "Jul 2025",
    sortYear: 2025.5,
    title: "AWS Certified Cloud Practitioner",
    org: "Amazon Web Services",
    detail: "Core AWS services, billing models and architectural best practice.",
    kind: "Certification"
  },
  {
    period: "Mar 2024 – May 2025",
    sortYear: 2025.4,
    title: "Full-Stack Developer & Technical Trainer",
    org: "YeMuyaWeg (የሙያ ወግ)",
    detail:
      "Built full-stack web applications end to end and trained young professionals in programming, web development, debugging and engineering practice, mentoring them through real projects.",
    kind: "Work"
  },
  {
    period: "Apr 2025",
    sortYear: 2025.25,
    title: "Professional Foundations certificate",
    org: "ALX Ethiopia",
    detail: "An intensive programme on teamwork, communication and working professionally.",
    kind: "Certification"
  },
  {
    period: "2024",
    sortYear: 2024,
    title: "Duolingo English Test, advanced proficiency",
    org: "Duolingo",
    detail: "Advanced scores across speaking, writing, reading and listening.",
    kind: "Certification"
  },
  {
    period: "2018 – 2021",
    sortYear: 2021,
    title: "High school diploma",
    org: "Ethio-Parents' School",
    detail: "Graduated with a score of 521 on the national 12th-grade examination.",
    kind: "Education"
  }
];

export const faq = [
  {
    q: "What kind of work are you open to?",
    a: "I'm an AI automation developer and cloud engineer at MMCY today, and open to the right next step: automation, cloud or platform engineering roles, or full-stack work with a strong operations side. Remote or on-site in Addis Ababa both work, and I'm open to relocating for the right team."
  },
  {
    q: "What does your day-to-day stack look like?",
    a: "Python, PowerShell and Power Automate for the automation itself; Microsoft 365, the Graph API, SharePoint and Entra ID on the Microsoft side; AWS for cloud; Zabbix, Wazuh and Graylog for monitoring; and Node.js, TypeScript and React when there's an interface to build."
  },
  {
    q: "How current are the AWS certifications?",
    a: "Both are from 2025: Cloud Practitioner in July and Solutions Architect – Associate in October. I'm now working toward the Solutions Architect – Professional, on top of hands-on cloud and hybrid work every week."
  },
  {
    q: "Can I see a CV?",
    a: "Yes. It's a two-page PDF and there's a link at the top of the page and in the footer."
  },
  {
    q: "How quickly do you reply?",
    a: "Within a day on email. I'm on East Africa Time (UTC+3), which overlaps comfortably with Europe and the Gulf, and with the US East Coast in the afternoon."
  }
];
