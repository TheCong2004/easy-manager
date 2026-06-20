-- Supabase Migration: 20260620000000_init_schema.sql
-- Description: Initialize schema for workspaces, pages, forms, form submissions, funnels, and funnel events.

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create workspaces table
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create workspace_members table
CREATE TABLE IF NOT EXISTS public.workspace_members (
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (workspace_id, user_id)
);

-- 3. Create pages table
CREATE TABLE IF NOT EXISTS public.pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    draft_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    published_data JSONB,
    bg_color TEXT,
    primary_color TEXT,
    font_family TEXT,
    custom_domain TEXT UNIQUE,
    pixel_id TEXT,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create forms table
CREATE TABLE IF NOT EXISTS public.forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    submit_color TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create form_submissions table
CREATE TABLE IF NOT EXISTS public.form_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'CONVERTED', 'SPAM')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Create funnels table
CREATE TABLE IF NOT EXISTS public.funnels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('immediate', 'scroll', 'exit_intent', 'inactivity')),
    trigger_value INTEGER, -- Trigger threshold (e.g. scroll percentage or time delay in seconds)
    action_type TEXT NOT NULL CHECK (action_type IN ('show_popup', 'redirect_url')),
    action_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Create funnel_events table
CREATE TABLE IF NOT EXISTS public.funnel_events (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL, -- e.g. page_view, scroll_threshold, exit_intent_trigger, click_cta, form_submit
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_pages_slug ON public.pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_workspace_id ON public.pages(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_forms_page_id ON public.forms(page_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_id ON public.form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_page_id ON public.form_submissions(page_id);
CREATE INDEX IF NOT EXISTS idx_funnels_page_id ON public.funnels(page_id);
CREATE INDEX IF NOT EXISTS idx_funnel_events_page_id ON public.funnel_events(page_id);
CREATE INDEX IF NOT EXISTS idx_funnel_events_session_id ON public.funnel_events(session_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

-- Helper function to check workspace membership
CREATE OR REPLACE FUNCTION public.is_workspace_member(workspace_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.workspace_members 
        WHERE workspace_members.workspace_id = is_workspace_member.workspace_id 
          AND workspace_members.user_id = is_workspace_member.user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for workspaces
CREATE POLICY "Users can view workspaces they own or are members of" 
    ON public.workspaces FOR SELECT 
    USING (owner_id = auth.uid() OR public.is_workspace_member(id, auth.uid()));

CREATE POLICY "Users can insert workspaces they own" 
    ON public.workspaces FOR INSERT 
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update workspaces they own" 
    ON public.workspaces FOR UPDATE 
    USING (owner_id = auth.uid());

CREATE POLICY "Users can delete workspaces they own" 
    ON public.workspaces FOR DELETE 
    USING (owner_id = auth.uid());

-- Policies for workspace_members
CREATE POLICY "Members can view workspace member list" 
    ON public.workspace_members FOR SELECT 
    USING (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.workspaces 
        WHERE workspaces.id = workspace_members.workspace_id AND workspaces.owner_id = auth.uid()
    ));

CREATE POLICY "Workspace owners can manage members" 
    ON public.workspace_members FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM public.workspaces 
        WHERE workspaces.id = workspace_members.workspace_id AND workspaces.owner_id = auth.uid()
    ));

-- Policies for pages
CREATE POLICY "Users can view pages in their workspaces" 
    ON public.pages FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM public.workspaces 
        WHERE workspaces.id = pages.workspace_id 
          AND (workspaces.owner_id = auth.uid() OR public.is_workspace_member(workspaces.id, auth.uid()))
    ) OR status = 'PUBLISHED'); -- Public can view published pages

CREATE POLICY "Users can manage pages in their workspaces" 
    ON public.pages FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM public.workspaces 
        WHERE workspaces.id = pages.workspace_id 
          AND (workspaces.owner_id = auth.uid() OR public.is_workspace_member(workspaces.id, auth.uid()))
    ));

-- Policies for forms
CREATE POLICY "Users can view forms for their pages" 
    ON public.forms FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM public.pages 
        JOIN public.workspaces ON workspaces.id = pages.workspace_id
        WHERE pages.id = forms.page_id 
          AND (workspaces.owner_id = auth.uid() OR public.is_workspace_member(workspaces.id, auth.uid()))
    ) OR EXISTS (
        SELECT 1 FROM public.pages 
        WHERE pages.id = forms.page_id AND pages.status = 'PUBLISHED'
    ));

CREATE POLICY "Users can manage forms for their pages" 
    ON public.forms FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM public.pages 
        JOIN public.workspaces ON workspaces.id = pages.workspace_id
        WHERE pages.id = forms.page_id 
          AND (workspaces.owner_id = auth.uid() OR public.is_workspace_member(workspaces.id, auth.uid()))
    ));

-- Policies for form_submissions
CREATE POLICY "Users can view submissions for their pages" 
    ON public.form_submissions FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM public.pages 
        JOIN public.workspaces ON workspaces.id = pages.workspace_id
        WHERE pages.id = form_submissions.page_id 
          AND (workspaces.owner_id = auth.uid() OR public.is_workspace_member(workspaces.id, auth.uid()))
    ));

CREATE POLICY "Anyone can submit a form" 
    ON public.form_submissions FOR INSERT 
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.pages 
        WHERE pages.id = form_submissions.page_id AND pages.status = 'PUBLISHED'
    ));

CREATE POLICY "Users can update submissions for their pages" 
    ON public.form_submissions FOR UPDATE 
    USING (EXISTS (
        SELECT 1 FROM public.pages 
        JOIN public.workspaces ON workspaces.id = pages.workspace_id
        WHERE pages.id = form_submissions.page_id 
          AND (workspaces.owner_id = auth.uid() OR public.is_workspace_member(workspaces.id, auth.uid()))
    ));

-- Policies for funnels
CREATE POLICY "Users can view funnels for their pages" 
    ON public.funnels FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM public.pages 
        JOIN public.workspaces ON workspaces.id = pages.workspace_id
        WHERE pages.id = funnels.page_id 
          AND (workspaces.owner_id = auth.uid() OR public.is_workspace_member(workspaces.id, auth.uid()))
    ) OR (is_active = true AND EXISTS (
        SELECT 1 FROM public.pages 
        WHERE pages.id = funnels.page_id AND pages.status = 'PUBLISHED'
    )));

CREATE POLICY "Users can manage funnels for their pages" 
    ON public.funnels FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM public.pages 
        JOIN public.workspaces ON workspaces.id = pages.workspace_id
        WHERE pages.id = funnels.page_id 
          AND (workspaces.owner_id = auth.uid() OR public.is_workspace_member(workspaces.id, auth.uid()))
    ));

-- Policies for funnel_events
CREATE POLICY "Users can view tracking events for their pages" 
    ON public.funnel_events FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM public.pages 
        JOIN public.workspaces ON workspaces.id = pages.workspace_id
        WHERE pages.id = funnel_events.page_id 
          AND (workspaces.owner_id = auth.uid() OR public.is_workspace_member(workspaces.id, auth.uid()))
    ));

CREATE POLICY "Anyone can insert tracking events" 
    ON public.funnel_events FOR INSERT 
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.pages 
        WHERE pages.id = funnel_events.page_id AND pages.status = 'PUBLISHED'
    ));
