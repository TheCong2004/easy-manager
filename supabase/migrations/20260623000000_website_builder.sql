-- Migration: website projects table
CREATE TABLE IF NOT EXISTS public.website_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'SEO', -- 'SEO' hoặc 'PPC'
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'published'
    source_type TEXT NOT NULL DEFAULT 'scratch', -- 'scratch', 'ai_prompt', 'clone_url', 'import_zip'
    source_value TEXT,
    job_status TEXT NOT NULL DEFAULT 'completed', -- 'pending', 'processing', 'completed', 'failed'
    job_error TEXT,
    job_progress INTEGER DEFAULT 100,
    slug TEXT UNIQUE,
    published_at TIMESTAMP WITH TIME ZONE,
    schema_data JSONB NOT NULL DEFAULT '{"pages": [{"id": "home", "title": "Trang chủ", "sections": []}]}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bật Row Level Security (RLS)
ALTER TABLE public.website_projects ENABLE ROW LEVEL SECURITY;

-- Tạo các chính sách bảo mật (Policies)
-- 1. Cho phép người dùng đọc dự án của chính họ
CREATE POLICY "Users can select their own website projects"
ON public.website_projects
FOR SELECT
USING (auth.uid() = user_id);

-- 2. Cho phép người dùng chèn dự án của chính họ
CREATE POLICY "Users can insert their own website projects"
ON public.website_projects
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Cho phép người dùng cập nhật dự án của chính họ
CREATE POLICY "Users can update their own website projects"
ON public.website_projects
FOR UPDATE
USING (auth.uid() = user_id);

-- 4. Cho phép người dùng xóa dự án của chính họ
CREATE POLICY "Users can delete their own website projects"
ON public.website_projects
FOR DELETE
USING (auth.uid() = user_id);

-- 5. Cho phép mọi người đọc dự án đã xuất bản
CREATE POLICY "Anyone can view published website projects"
ON public.website_projects
FOR SELECT
USING (status = 'published');
