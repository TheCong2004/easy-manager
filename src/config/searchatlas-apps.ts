export interface SearchAtlasApp {
  key: string;
  label: string;
  route: string;
  description: string;
  status: "ready" | "partial" | "coming_soon";
  icon: string; // Identifier for selecting the appropriate SVG/icon
}

export const SEARCHATLAS_APPS: SearchAtlasApp[] = [
  {
    key: "coworker",
    label: "Coworker",
    route: "/coworker",
    description: "AI coworker for automate SEO workflows, playbooks, and custom commands.",
    status: "partial",
    icon: "coworker",
  },
  {
    key: "otto-seo",
    label: "OTTO SEO",
    route: "/otto-seo",
    description: "SEO automation projects, task tracking, installation guides, and crawl monitoring.",
    status: "partial",
    icon: "otto-seo",
  },
  {
    key: "site-metrics",
    label: "Site Metrics",
    route: "/site-metrics",
    description: "Domain overview, traffic visibility metrics, audit score, and technical health checks.",
    status: "partial",
    icon: "site-metrics",
  },
  {
    key: "llm-visibility",
    label: "LLM Visibility",
    route: "/llm-visibility",
    description: "AI/LLM search visibility tracker and queries share of voice analysis.",
    status: "partial",
    icon: "llm-visibility",
  },
  {
    key: "local",
    label: "Local SEO",
    route: "/local",
    description: "Google Business Profile manager, location ranking maps, and citation auditing.",
    status: "partial",
    icon: "local",
  },
  {
    key: "content",
    label: "Content Suite",
    route: "/content",
    description: "Content Assistant, Topical Maps builder, Semantic Grader, and AI rewriter tools.",
    status: "partial",
    icon: "content",
  },
  {
    key: "keywords",
    label: "Keywords Research",
    route: "/keywords",
    description: "Keyword search database, difficulty meter, and search volume estimation.",
    status: "partial",
    icon: "keywords",
  },
  {
    key: "reports",
    label: "Reports",
    route: "/bao-cao",
    description: "Custom report builder, GSC metrics integration, and automated PDF delivery schedule.",
    status: "ready",
    icon: "reports",
  },
  {
    key: "authority",
    label: "Authority Suite",
    route: "/authority",
    description: "Backlinks history tracking, referring domain analysis, and link outreach tools.",
    status: "coming_soon",
    icon: "authority",
  },
];
