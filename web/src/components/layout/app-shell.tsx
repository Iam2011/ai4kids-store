import { BottomNav } from "./bottom-nav";
import { Header } from "./header";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,237,245,0.95),_rgba(248,244,255,0.92)_38%,_rgba(244,240,255,0.95)_100%)]">
      <Header />
      {children}
      <BottomNav />
    </div>
  );
}
