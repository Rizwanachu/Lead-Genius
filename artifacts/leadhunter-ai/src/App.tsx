import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import LeadFinder from "@/pages/LeadFinder";
import LeadAnalyzer from "@/pages/LeadAnalyzer";
import OutreachGenerator from "@/pages/OutreachGenerator";
import CampaignManager from "@/pages/CampaignManager";
import Settings from "@/pages/Settings";
import AppLayout from "@/components/AppLayout";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/leads" component={LeadFinder} />
      <Route path="/analyzer" component={LeadAnalyzer} />
      <Route path="/outreach" component={OutreachGenerator} />
      <Route path="/campaigns" component={CampaignManager} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppLayout>
            <Router />
          </AppLayout>
        </WouterRouter>
        <Toaster position="top-right" theme="system" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;