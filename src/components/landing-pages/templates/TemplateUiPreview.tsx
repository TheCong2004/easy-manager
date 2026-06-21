"use client";

import React from "react";
import { TemplateItem } from "../dung-chung/types";
import { LANDING_TEMPLATE_PRESETS, LandingTemplatePreset, resolveTemplatePresetId } from "../editor/template-library";
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

function getPreset(template: TemplateItem): LandingTemplatePreset {
  const presetId = resolveTemplatePresetId({ id: template.id, name: template.name });
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
