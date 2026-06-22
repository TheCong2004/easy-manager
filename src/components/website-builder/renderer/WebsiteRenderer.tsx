import React from "react";
import { WebsiteSection, WebsiteSchema } from "@/types/website-builder";
import SectionRenderer from "./SectionRenderer";

interface WebsiteRendererProps {
  sections?: WebsiteSection[];
  schema?: WebsiteSchema;
  mode?: "edit" | "preview";
  activeSectionId?: string | null;
  onFieldClick?: (sectionId: string, field: string, value: string) => void;
  primaryColor?: string;
}

export const WebsiteRenderer: React.FC<WebsiteRendererProps> = ({
  sections,
  schema,
  mode = "preview",
  activeSectionId,
  onFieldClick,
  primaryColor,
}) => {
  // Trích xuất list sections từ props hoặc schema
  let rawSections: WebsiteSection[] = [];
  if (sections && sections.length > 0) {
    rawSections = sections;
  } else if (schema) {
    if (schema.sections && schema.sections.length > 0) {
      rawSections = schema.sections;
    } else if (schema.pages && schema.pages.length > 0) {
      // Mặc định lấy trang đầu tiên hoặc trang home
      const homePage = schema.pages.find((p) => p.id === "home") || schema.pages[0];
      rawSections = homePage?.sections || [];
    }
  }

  if (rawSections.length === 0) {
    return null;
  }

  // Sắp xếp các sections theo orderIndex tăng dần
  const sortedSections = [...rawSections].sort((a, b) => {
    const orderA = a.orderIndex !== undefined && a.orderIndex !== null ? a.orderIndex : 9999;
    const orderB = b.orderIndex !== undefined && b.orderIndex !== null ? b.orderIndex : 9999;
    return orderA - orderB;
  });

  const finalPrimaryColor = primaryColor || schema?.primaryColor;

  return (
    <div className="w-full h-full">
      {sortedSections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          mode={mode}
          activeSectionId={activeSectionId}
          onFieldClick={onFieldClick}
          primaryColor={finalPrimaryColor}
        />
      ))}
    </div>
  );
};

export default WebsiteRenderer;
