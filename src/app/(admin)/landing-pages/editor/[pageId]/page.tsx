import { Metadata } from "next";
import { LandingEditorPageClient } from "@/components/landing-pages/editor/LandingEditorPageClient";

interface Props {
  params: Promise<{ pageId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pageId } = await params;
  return {
    title: `Editor | ${pageId}`,
  };
}

export default async function LandingEditorPage({ params }: Props) {
  const { pageId } = await params;
  return <LandingEditorPageClient pageId={pageId} />;
}
