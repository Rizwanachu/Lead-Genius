import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/dashboard";
import LeadsList from "@/pages/leads/index";
import LeadDetail from "@/pages/leads/detail";
import CampaignsList from "@/pages/campaigns/index";
import CampaignDetail from "@/pages/campaigns/detail";
import OutreachList from "@/pages/outreach/index";
import Analytics from "@/pages/analytics/index";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/leads" component={LeadsList} />
        <Route path="/leads/:id" component={LeadDetail} />
        <Route path="/campaigns" component={CampaignsList} />
        <Route path="/campaigns/:id" component={CampaignDetail} />
        <Route path="/outreach" component={OutreachList} />
        <Route path="/analytics" component={Analytics} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;