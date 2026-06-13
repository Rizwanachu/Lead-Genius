import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Search, 
  MessageCircle,
  Wrench,
  FolderKanban
} from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/leads", label: "Search", icon: Search },
  { href: "/conversations", label: "Chat", icon: MessageCircle },
  { href: "/campaigns", label: "Campaigns", icon: FolderKanban },
  { href: "/tools", label: "Tools", icon: Wrench },
];

export default function BottomNav() {
  const [location] = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/90 backdrop-blur-md border-t border-border z-50 px-2 flex items-center justify-around">
      {navItems.map((item) => {
        const isActive = location === item.href;
        return (
          <Link 
            key={item.href} 
            href={item.href}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid={`link-bottom-nav-${item.label.toLowerCase().replace(' ', '-')}`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}