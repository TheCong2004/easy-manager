"use client";

import React from "react";
import { TemplateItem } from "../dung-chung/types";
import { LANDING_TEMPLATE_PRESETS, LandingTemplatePreset } from "../editor/template-library";
import { EditorBlock } from "../editor/types";
import { HeroBlock } from "../editor/blocks/HeroBlock";
import { TextBlock } from "../editor/blocks/TextBlock";
import { ImageBlock } from "../editor/blocks/ImageBlock";
import { ButtonBlock } from "../editor/blocks/ButtonBlock";
import { SpacerBlock, DividerBlock } from "../editor/blocks/SpacerBlock";
import { FeatureCardBlock, TestimonialBlock } from "../editor/blocks/SocialBlocks";
import { CountdownBlock, VideoBlock, FormCaptureBlock } from "../editor/blocks/AdvancedBlocks";
import { TeaLandingBlock } from "../editor/blocks/TeaLandingBlock";
import { ChatWidgetBlock, FunnelPopupBlock } from "../editor/blocks/WidgetBlocks";
import {
  AccordionBlock,
  BoxBlock,
  CarouselBlock,
  CollectionListBlock,
  FrameBlock,
  GalleryBlock,
  HtmlCodeBlock,
  IconBlock,
  MenuBlock,
  ProductCardBlock,
  SurveyBlock,
  TableBlock,
  TabsBlock,
} from "../editor/blocks/NewLadiBlocks";

function resolveTemplatePresetId(template: TemplateItem): string {
  const value = `${template.id} ${template.name} ${template.category}`.toLowerCase();

  // Legacy templates
  if (value.includes("112306") || value.includes("wedding") || value.includes("cuoi")) return "wedding-invite";
  if (value.includes("112305") || value.includes("112309") || value.includes("my pham")) return "beauty-shop";
  if (value.includes("112307") || value.includes("tea") || value.includes("tra")) return "herb-tea";
  if (value.includes("112308") || value.includes("smartwatch") || value.includes("dong ho")) return "smartwatch-performance";
  if (value.includes("112312") || value.includes("course")) return "webinar-lead";
  if (value.includes("112313") || value.includes("slide show") || value.includes("carousel")) return "hero-slide-show";
  if (value.includes("112314") || value.includes("product grid") || value.includes("flash sale")) return "ladi-product-grid";
  if (value.includes("112315") || value.includes("course funnel") || value.includes("e-learning")) return "course-slide-funnel";
  if (value.includes("112316") || value.includes("gallery showcase")) return "gallery-showcase";
  if (value.includes("112317") || value.includes("builder product kit")) return "builder-product-kit";
  if (value.includes("112318") || value.includes("builder ui elements")) return "builder-ui-elements";
  if (value.includes("112310") || value.includes("grand") || value.includes("khai trương") || value.includes("khai truong")) return "grand-opening";
  if (value.includes("112311")) return "finance-consulting";

  // 12 new templates — matched by ID prefix t15–t26
  if (value.includes("t15") || value.includes("saas") || value.includes("saas-minimal")) return "saas-minimal";
  if (value.includes("t16") || value.includes("ecommerce-bold") || value.includes("bold offer")) return "ecommerce-bold";
  if (value.includes("t17") || value.includes("real-estate") || value.includes("real estate")) return "real-estate-premium";
  if (value.includes("t18") || value.includes("online-course") || value.includes("online course")) return "online-course";
  if (value.includes("t19") || value.includes("webinar-event") || value.includes("webinar event")) return "webinar-event";
  if (value.includes("t20") || value.includes("agency-portfolio") || value.includes("agency portfolio")) return "agency-portfolio";
  if (value.includes("t21") || value.includes("clinic-trust") || value.includes("clinic trust")) return "clinic-trust";
  if (value.includes("t22") || value.includes("restaurant-menu") || value.includes("restaurant")) return "restaurant-menu";
  if (value.includes("t23") || value.includes("mobile-app") || value.includes("mobile app")) return "mobile-app";
  if (value.includes("t24") || value.includes("finance-lead") || value.includes("finance lead")) return "finance-lead";
  if (value.includes("t25") || value.includes("beauty-spa") || value.includes("beauty spa") || value.includes("spa")) return "beauty-spa";
  if (value.includes("t26") || value.includes("local-service") || value.includes("local service")) return "local-service";

  return "product-launch";
}


function getPreset(template: TemplateItem): LandingTemplatePreset {
  const presetId = resolveTemplatePresetId(template);
  return LANDING_TEMPLATE_PRESETS.find((preset) => preset.id === presetId) ?? LANDING_TEMPLATE_PRESETS[0];
}

function renderBlock(block: Omit<EditorBlock, "id">, index: number) {
  const props = block.props;
  const noop = () => undefined;

  switch (block.type) {
    case "hero":
      return <HeroBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "text":
      return <TextBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "image":
      return <ImageBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "button":
      return <ButtonBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "spacer":
      return <SpacerBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "divider":
      return <DividerBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "feature_card":
      return <FeatureCardBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "testimonial":
      return <TestimonialBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "countdown":
      return <CountdownBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "video":
      return <VideoBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "form_capture":
      return <FormCaptureBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "chat_widget":
      return <ChatWidgetBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "funnel_popup":
      return <FunnelPopupBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "tea_landing":
      return <TeaLandingBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "gallery":
      return <GalleryBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "box":
      return <BoxBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "icon":
      return <IconBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "product_card":
      return <ProductCardBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "collection_list":
      return <CollectionListBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "carousel":
      return <CarouselBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "tabs":
      return <TabsBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "frame":
      return <FrameBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "accordion":
      return <AccordionBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "table":
      return <TableBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "survey":
      return <SurveyBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "menu":
      return <MenuBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "html_code":
      return <HtmlCodeBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    default:
      return null;
  }
}

export function TemplateUiPreview({
  template,
  mode = "card",
}: {
  template: TemplateItem;
  mode?: "card" | "modal";
}) {
  const preset = getPreset(template);
  const scale = mode === "card" ? 0.34 : 1;

  if (mode === "modal") {
    return (
      <div className="landing-product-surface bg-white text-slate-950">
        {preset.blocks.map((block, index) => renderBlock(block, index))}
      </div>
    );
  }

  return (
    <div className="landing-product-surface h-full w-full overflow-hidden bg-white text-slate-950">
      <div
        className="template-ui-scroll-effect pointer-events-none"
        style={{
          width: `${100 / scale}%`,
          "--preview-scale": scale,
          "--scroll-dist": template.scrollDist || "calc(-100% + 780px)",
        } as React.CSSProperties}
      >
        {preset.blocks.map((block, index) => renderBlock(block, index))}
      </div>
    </div>
  );
}
