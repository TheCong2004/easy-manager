import React from "react";
import { WebsiteSection } from "@/types/website-builder";
import NavbarSection from "./sections/NavbarSection";
import HeroSection from "./sections/HeroSection";
import FeaturesSection from "./sections/FeaturesSection";
import ServicesSection from "./sections/ServicesSection";
import TestimonialsSection from "./sections/TestimonialsSection";
import FaqSection from "./sections/FaqSection";
import CtaSection from "./sections/CtaSection";
import ContactSection from "./sections/ContactSection";
import FooterSection from "./sections/FooterSection";
import UnknownSection from "./sections/UnknownSection";

interface SectionRendererProps {
  section: WebsiteSection;
  mode?: "edit" | "preview";
  activeSectionId?: string | null;
  onFieldClick?: (sectionId: string, field: string, value: string) => void;
  primaryColor?: string;
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({
  section,
  mode = "preview",
  activeSectionId,
  onFieldClick,
  primaryColor,
}) => {
  if (!section) return null;

  // Gộp props phẳng trên section (legacy) và props nằm trong section.props (schema mới)
  const resolvedProps = {
    ...section,
    ...(section.props || {}),
  } as any;

  const type = (section.type || "").toLowerCase();

  const sharedProps = {
    sectionId: section.id,
    mode,
    activeSectionId,
    onFieldClick,
    primaryColor: resolvedProps.settings?.backgroundColor || resolvedProps.backgroundColor || primaryColor,
  };

  switch (type) {
    case "navbar":
    case "header":
      return (
        <NavbarSection
          {...sharedProps}
          title={resolvedProps.title}
          items={resolvedProps.items}
        />
      );

    case "hero":
      return (
        <HeroSection
          {...sharedProps}
          title={resolvedProps.title}
          subtitle={resolvedProps.subtitle}
          content={resolvedProps.content}
          buttonText={resolvedProps.buttonText}
          buttonLink={resolvedProps.buttonLink}
          backgroundColor={resolvedProps.settings?.backgroundColor || resolvedProps.backgroundColor}
          textColor={resolvedProps.settings?.textColor || resolvedProps.textColor}
        />
      );

    case "features":
      return (
        <FeaturesSection
          {...sharedProps}
          title={resolvedProps.title}
          subtitle={resolvedProps.subtitle}
          items={resolvedProps.items}
        />
      );

    case "services":
      return (
        <ServicesSection
          {...sharedProps}
          title={resolvedProps.title}
          subtitle={resolvedProps.subtitle}
          items={resolvedProps.items}
        />
      );

    case "testimonials":
      return (
        <TestimonialsSection
          {...sharedProps}
          title={resolvedProps.title}
          subtitle={resolvedProps.subtitle}
          items={resolvedProps.items}
        />
      );

    case "faq":
      return (
        <FaqSection
          {...sharedProps}
          title={resolvedProps.title}
          subtitle={resolvedProps.subtitle}
          items={resolvedProps.items}
        />
      );

    case "cta":
      return (
        <CtaSection
          {...sharedProps}
          title={resolvedProps.title}
          subtitle={resolvedProps.subtitle}
          buttonText={resolvedProps.buttonText}
          buttonLink={resolvedProps.buttonLink}
          backgroundColor={resolvedProps.settings?.backgroundColor || resolvedProps.backgroundColor}
          textColor={resolvedProps.settings?.textColor || resolvedProps.textColor}
        />
      );

    case "contact":
      return (
        <ContactSection
          {...sharedProps}
          title={resolvedProps.title}
          subtitle={resolvedProps.subtitle}
          buttonText={resolvedProps.buttonText}
          namePlaceholder={resolvedProps.namePlaceholder}
          emailPlaceholder={resolvedProps.emailPlaceholder}
        />
      );

    case "footer":
      return (
        <FooterSection
          {...sharedProps}
          title={resolvedProps.title}
          subtitle={resolvedProps.subtitle}
        />
      );

    default:
      return (
        <UnknownSection
          {...sharedProps}
          type={section.type}
        />
      );
  }
};

export default SectionRenderer;
