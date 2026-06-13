import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Search, 
  Activity, 
  MessageSquare, 
  FolderKanban, 
  Settings,
  Target,
  MessageCircle,
  Wrench
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Lead Finder", icon: Search },
  { href: "/analyzer", label: "Analyzer", icon: Activity },
  { href: "/outreach", label: "Outreach", icon: MessageSquare },
  { href: "/conversations", label: "Conversations", icon: MessageCircle },
  { href: "/campaigns", label: "Campaigns", icon: FolderKanban },
  { href: "/tools", label: "Marketing Tools", icon: Wrench },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="hidden md:flex flex-col w-64 border-r border-border bg-card/50 backdrop-blur-sm h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
          <Target className="w-6 h-6" />
          <span className="font-bold text-lg tracking-tight font-sans text-foreground">LeadHunter AI</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 ${
                isActive 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              data-testid={`link-nav-${item.label.toLowerCase().replace(' ', '-')}`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-1">
        <Link 
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 ${
            location === "/settings" 
              ? "bg-primary/10 text-primary font-medium" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
          data-testid="link-nav-settings"
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm">Settings</span>
        </Link>
        <div className="px-3 pt-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Theme</span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}