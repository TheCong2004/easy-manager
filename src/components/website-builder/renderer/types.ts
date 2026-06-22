export interface BaseSectionProps {
  sectionId: string;
  mode?: "edit" | "preview";
  activeSectionId?: string | null;
  onFieldClick?: (sectionId: string, field: string, value: string) => void;
  primaryColor?: string;
  selectedNodeId?: string | null;
  onNodeSelect?: (nodeId: string) => void;
}

export interface NavbarSectionItem {
  title?: string;
  description?: string;
}

export interface NavbarProps extends BaseSectionProps {
  title?: string;
  items?: NavbarSectionItem[];
}

export interface HeroProps extends BaseSectionProps {
  title?: string;
  subtitle?: string;
  content?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface FeatureSectionItem {
  title?: string;
  description?: string;
  icon?: string;
}

export interface FeaturesProps extends BaseSectionProps {
  title?: string;
  subtitle?: string;
  items?: FeatureSectionItem[];
}

export interface ServiceSectionItem {
  title?: string;
  description?: string;
  icon?: string;
  price?: string;
  badge?: string;
}

export interface ServicesProps extends BaseSectionProps {
  title?: string;
  subtitle?: string;
  items?: ServiceSectionItem[];
}

export interface TestimonialSectionItem {
  author?: string;
  role?: string;
  avatar?: string;
  description?: string;
}

export interface TestimonialsProps extends BaseSectionProps {
  title?: string;
  subtitle?: string;
  items?: TestimonialSectionItem[];
}

export interface FaqSectionItem {
  question?: string;
  answer?: string;
  title?: string;
  description?: string;
}

export interface FaqProps extends BaseSectionProps {
  title?: string;
  subtitle?: string;
  items?: FaqSectionItem[];
}

export interface CtaProps extends BaseSectionProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface ContactProps extends BaseSectionProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  namePlaceholder?: string;
  emailPlaceholder?: string;
}

export interface FooterProps extends BaseSectionProps {
  title?: string;
  subtitle?: string;
}
