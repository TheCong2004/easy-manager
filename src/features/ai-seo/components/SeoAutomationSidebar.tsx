import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Bot,
  BarChart2,
  MapPin,
  FileText,
  Key,
  FolderKanban,
  FileCode,
  ShieldCheck,
} from "lucide-react";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

export function SeoAutomationSidebar() {
  const pathname = usePathname();

  const navigation: SidebarItem[] = [
    { name: "Tổng quan", href: "/ai-seo", icon: Home },
    { name: "AI SEO Automation", href: "/ai-seo", icon: Bot },
    { name: "Site Metrics", href: "/ai-seo/metrics", icon: BarChart2 },
    { name: "Local SEO", href: "/ai-seo/local", icon: MapPin },
    { name: "Content Assistant", href: "/ai-seo/content", icon: FileText },
    { name: "Keywords", href: "/ai-seo/keywords", icon: Key },
    { name: "Báo cáo", href: "/ai-seo/reports", icon: FolderKanban },
    { name: "Authority Builder", href: "/ai-seo/authority", icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0 text-slate-300">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-slate-800 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-violet-500/20">
          Ω
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm text-white tracking-wide leading-none">
            OTTO SEO
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            AI Automation Engine
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navigation.map((item, idx) => {
          // Highlight the AI SEO Automation tab as active
          const isActive = idx === 1; // AI SEO Automation is the main dashboard active item

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition duration-150 group ${
                isActive
                  ? "bg-violet-600/10 text-violet-400 border-l-2 border-violet-500"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <item.icon
                className={`w-4 h-4 transition duration-150 ${
                  isActive
                    ? "text-violet-400"
                    : "text-slate-450 group-hover:text-slate-200"
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-center">
        <span className="text-[10px] text-slate-650 block">v3.88.0 - Ready</span>
      </div>
    </aside>
  );
}
export default SeoAutomationSidebar;
