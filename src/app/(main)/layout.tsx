import type { ReactNode } from "react";
import { Sidebar } from "@/components/layouts/Sidebar";
import { BottomNav } from "@/components/layouts/BottomNav";
import { RightPanel } from "@/components/layouts/RightPanel";
import { GlobalInitializer } from "@/components/layouts/GlobalInitializer";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg-base)]">
      <GlobalInitializer />
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="lg:ml-[280px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-8">
          <div className="flex gap-6 xl:gap-8">
            {/* Center column */}
            <main className="flex-1 min-w-0 py-6 pb-24 lg:pb-6">
              {children}
            </main>

            {/* Right panel */}
            <RightPanel />
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
