import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] w-full bg-background font-sans text-foreground">
      <Sidebar />
      <main className="flex-1 w-full pb-16 md:pb-0 overflow-x-hidden">
        <div className="mx-auto max-w-7xl p-4 md:p-8">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}