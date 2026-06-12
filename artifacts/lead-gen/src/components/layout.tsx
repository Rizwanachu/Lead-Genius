import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, Megaphone, Send, BarChart3, Zap, Bell, Settings, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/leads", label: "Leads", icon: Users },
    { href: "/campaigns", label: "Campaigns", icon: Megaphone },
    { href: "/outreach", label: "Outreach", icon: Send },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex w-full">
      <aside className="w-64 border-r border-border bg-card flex flex-col shrink-0">
        <div className="h-16 flex items-center px-5 border-b border-border gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground tracking-tight leading-none">LeadFlow AI</h1>
            <p className="text-[10px] text-muted-foreground mt-0.5">Agency Platform</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 mt-1">Main Menu</p>
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-3 h-3 opacity-60" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-foreground">AI Engine Active</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Template-based generation ready</p>
          </div>
          <div className="mt-2 flex items-center gap-2 px-1">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">A</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">Agency Admin</p>
              <p className="text-[10px] text-muted-foreground truncate">admin@leadflow.ai</p>
            </div>
            <Settings className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground cursor-pointer" />
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card/50 flex items-center px-8 gap-4 shrink-0">
          <div className="flex-1" />
          <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-primary">3</Badge>
          </button>
          <div className="h-8 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">A</div>
            <span className="text-sm font-medium">Admin</span>
          </div>
        </header>
        <div className="flex-1 p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
