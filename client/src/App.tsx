import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import { CommandPalette } from "./components/CommandPalette";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Contacts from "./pages/Contacts";
import Companies from "./pages/Companies";
import Deals from "./pages/Deals";
import DealsKanban from "./pages/DealsKanban";
import ICPs from "./pages/ICPs";
import Leads from "./pages/Leads";
import Tasks from "./pages/Tasks";
import Goals from "./pages/Goals";
import Activities from "./pages/Activities";
import Articles from "./pages/Articles";
import AIChat from "./pages/AIChat";
import AIInsights from "./pages/AIInsights";
import CollateralGenerator from "./pages/CollateralGenerator";
import EmailSequences from "./pages/EmailSequences";
import Team from "./pages/Team";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/contacts" component={Contacts} />
      <Route path="/companies" component={Companies} />
      <Route path="/deals" component={Deals} />
      <Route path="/deals/kanban" component={DealsKanban} />
      <Route path="/icps" component={ICPs} />
      <Route path="/leads" component={Leads} />
      <Route path="/tasks" component={Tasks} />
      <Route path="/goals" component={Goals} />
      <Route path="/activities" component={Activities} />
      <Route path="/articles" component={Articles} />
      <Route path="/ai-chat" component={AIChat} />
      <Route path="/ai-insights" component={AIInsights} />
      <Route path="/collateral" component={CollateralGenerator} />
      <Route path="/email-sequences" component={EmailSequences} />
      <Route path="/team" component={Team} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <WebSocketProvider>
          <TooltipProvider>
            <Toaster />
            <CommandPalette />
            <DashboardLayout>
              <Router />
            </DashboardLayout>
          </TooltipProvider>
        </WebSocketProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
