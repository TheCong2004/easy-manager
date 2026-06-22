"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  listWebsiteProjects,
  WebsiteProject,
  WebsiteSchema,
  DEFAULT_SCHEMA
} from "@/components/website-builder/core/website-db-storage";
import WebsiteRenderer from "@/components/website-builder/renderer/WebsiteRenderer";

interface PublicPageProps {
  params: Promise<{ slug: string }>;
}

export default function PublicWebsitePage({ params }: PublicPageProps) {
  const router = useRouter();
  const { slug } = use(params);

  const [project, setProject] = useState<WebsiteProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const projects = await listWebsiteProjects();
        // Tìm website có slug khớp và đã xuất bản
        const found = projects.find(p => p.slug === slug && p.status === "published");
        if (found) {
          setProject(found);
        }
      } catch (err) {
        console.error("Failed to load public website:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-boxdark">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Đang tải trang web...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <div className="max-w-md">
          <h1 className="text-6xl font-extrabold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy trang web</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Địa chỉ liên kết này không tồn tại hoặc website chưa được xuất bản công khai. Vui lòng kiểm tra lại đường dẫn.
          </p>
          <button
            onClick={() => router.push("/website-builder")}
            className="rounded-md bg-primary py-2 px-5 text-sm font-semibold text-white shadow hover:bg-opacity-95"
          >
            Quay lại trang quản lý
          </button>
        </div>
      </div>
    );
  }

  const schema: WebsiteSchema = project.schema_data || DEFAULT_SCHEMA;
  const homePage = schema.pages.find((p: any) => p.id === "home") || schema.pages[0];

  return (
    <div
      className="min-h-screen bg-white text-black"
      style={{ fontFamily: schema.fontFamily || "Inter" }}
    >
      <WebsiteRenderer schema={schema} mode="preview" />
    </div>
  );
}
