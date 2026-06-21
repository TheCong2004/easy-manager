-- Builder element presets used by the landing page editor.

CREATE TABLE IF NOT EXISTS public.builder_element_presets (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    label TEXT NOT NULL,
    search_text TEXT NOT NULL DEFAULT '',
    block_type TEXT NOT NULL,
    props JSONB NOT NULL DEFAULT '{}'::jsonb,
    preview JSONB NOT NULL DEFAULT '{}'::jsonb,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_builder_element_presets_category
    ON public.builder_element_presets(category, sort_order);

CREATE INDEX IF NOT EXISTS idx_builder_element_presets_active
    ON public.builder_element_presets(is_active);

ALTER TABLE public.builder_element_presets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active builder element presets"
    ON public.builder_element_presets;

CREATE POLICY "Anyone can view active builder element presets"
    ON public.builder_element_presets
    FOR SELECT
    USING (is_active = true);
