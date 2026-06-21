import { Metadata } from "next";
import { LandingEditorPageClient } from "@/components/landing-pages/editor/LandingEditorPageClient";

interface Props {
  params: { pageId: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Editor | ${params.pageId}`,
  };
}

export default function LandingEditorPage({ params }: Props) {
  return <LandingEditorPageClient pageId={params.pageId} />;
}
