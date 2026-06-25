import React from "react";

interface SeoAutomationShellProps {
  children: React.ReactNode;
}

export function SeoAutomationShell({ children }: SeoAutomationShellProps) {
  return <div className="flex-1 bg-slate-950 flex flex-col min-h-screen">{children}</div>;
}
export default SeoAutomationShell;
