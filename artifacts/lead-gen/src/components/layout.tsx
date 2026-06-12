import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, Megaphone, Send, BarChart } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/leads", label: "Leads", icon: Users },
    { href: "/campaigns", label: "Campaigns", icon: Megaphone },
    { href: "/outreach", label: "Outreach", icon: Send },
    { href: "/analytics", label: "Analytics", icon: BarChart },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex w-full">
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <h1 className="text-xl font-bold text-primary tracking-tight">LeadFlow AI</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
              >
                  <Icon className="w-4 h-4" />
                  {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 flex flex-col">
        <div className="flex-1 p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}