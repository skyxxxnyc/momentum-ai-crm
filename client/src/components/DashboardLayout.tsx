import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { LogOut, PanelLeft, PanelLeftClose, ChevronDown, BookTemplate } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { NotificationCenter } from "./NotificationCenter";
import { OnboardingTour } from "./OnboardingTour";
import { KeyboardShortcuts } from "./KeyboardShortcuts";

import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Target, 
  Zap, 
  Mail, 
  FileText, 
  CheckSquare, 
  TrendingUp, 
  Activity, 
  BookOpen, 
  UserPlus, 
  Sparkles, 
  FileCode,
  CalendarClock,
  Clock,
  PenSquare,
  Database,
  Library,
  Settings
} from "lucide-react";

const menuGroups = [
  {
    label: "Overview",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    ],
  },
  {
    label: "CRM",
    items: [
      { icon: Users, label: "Contacts", path: "/contacts" },
      { icon: Building2, label: "Companies", path: "/companies" },
      { icon: Target, label: "Deals", path: "/deals" },
      { icon: Target, label: "Pipeline", path: "/deals/kanban" },
      { icon: UserPlus, label: "Leads", path: "/leads" },
    ],
  },
  {
    label: "Productivity",
    items: [
      { icon: CheckSquare, label: "Tasks", path: "/tasks" },
      { icon: TrendingUp, label: "Goals", path: "/goals" },
      { icon: Activity, label: "Activities", path: "/activities" },
      { icon: CalendarClock, label: "Calendar", path: "/calendar" },
    ],
  },
  {
    label: "AI Tools",
    items: [
      { icon: Zap, label: "AI Chat", path: "/ai-chat" },
      { icon: Sparkles, label: "AI Insights", path: "/ai-insights" },
      { icon: FileCode, label: "Collateral", path: "/collateral" },
      { icon: Sparkles, label: "Prospecting", path: "/prospecting" },
      { icon: FileText, label: "ICPs", path: "/icps" },
      { icon: Clock, label: "Scheduler", path: "/prospecting-scheduler" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { icon: Mail, label: "Email Sequences", path: "/email-sequences" },
      { icon: FileText, label: "Email Templates", path: "/email-templates" },
      { icon: BookTemplate, label: "Sequence Templates", path: "/sequence-templates" },
      { icon: BookOpen, label: "Articles", path: "/articles" },
      { icon: PenSquare, label: "Blog", path: "/blog-editor" },
    ],
  },
  {
    label: "Settings",
    items: [
      { icon: Library, label: "Knowledge Hub", path: "/knowledge" },
      { icon: Database, label: "Notion Sync", path: "/notion" },
      { icon: Users, label: "Team", path: "/team" },
    ],
  },
];

const SIDEBAR_WIDTH_KEY = "dashboard_sidebar_width";
const SIDEBAR_COLLAPSED_KEY = "dashboard_sidebar_collapsed";
const DEFAULT_WIDTH = 240;
const COLLAPSED_WIDTH = 64;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    return saved === "true";
  });
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();
  const [openGroups, setOpenGroups] = useState<string[]>(["Overview", "CRM", "AI Tools"]);
  const [searchQuery, setSearchQuery] = useState("");
  const logoutMutation = trpc.auth.logout.useMutation();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, isCollapsed.toString());
  }, [isCollapsed]);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => 
      prev.includes(label) 
        ? prev.filter(g => g !== label)
        : [...prev, label]
    );
  };

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <img src={APP_LOGO} alt={APP_TITLE} className="h-16 w-16" />
          <h1 className="text-3xl font-bold">{APP_TITLE}</h1>
          <p className="text-muted-foreground text-center">
            Please sign in to access your CRM
          </p>
          <Button asChild className="w-full">
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <OnboardingTour />
      <KeyboardShortcuts />
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
        <Sidebar
          style={{ "--sidebar-width": `${isCollapsed ? COLLAPSED_WIDTH : sidebarWidth}px` } as CSSProperties}
          className="border-r border-border"
        >
          <SidebarHeader className="border-b border-border p-4">
            <div className="flex items-center gap-3 justify-center">
              <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />
              {!isCollapsed && (
                <span className="text-lg">
                  <span className="font-light">sia</span>
                  <span className="font-bold">CRM</span>
                </span>
              )}
            </div>
          </SidebarHeader>

          <SidebarContent>
            {!isCollapsed && (
              <div className="px-3 py-2">
                <input
                  type="text"
                  placeholder="Search pages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            )}
            <SidebarMenu>
              {menuGroups
                .map((group) => ({
                  ...group,
                  items: group.items.filter((item) =>
                    searchQuery
                      ? item.label.toLowerCase().includes(searchQuery.toLowerCase())
                      : true
                  ),
                }))
                .filter((group) => group.items.length > 0)
                .map((group) =>
                  isCollapsed ? (
                  // Collapsed mode: show only icons with tooltips
                  <div key={group.label} className="space-y-1">
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.path}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton asChild>
                              <a href={item.path} className="flex items-center justify-center w-full">
                                <item.icon className="h-5 w-5" />
                              </a>
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>{item.label}</p>
                          </TooltipContent>
                        </Tooltip>
                      </SidebarMenuItem>
                    ))}
                  </div>
                ) : (
                  // Expanded mode: show groups with labels
                  <Collapsible
                    key={group.label}
                    open={openGroups.includes(group.label)}
                    onOpenChange={() => toggleGroup(group.label)}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="w-full">
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {group.label}
                          </span>
                          <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {group.items.map((item) => (
                            <SidebarMenuSubItem key={item.path}>
                              <SidebarMenuSubButton asChild>
                                <a href={item.path} className="flex items-center gap-3 px-3 py-2">
                                  <item.icon className="h-4 w-4" />
                                  <span>{item.label}</span>
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )
              )}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t border-border p-4 space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full justify-center"
            >
              {isCollapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <>
                  <PanelLeftClose className="h-4 w-4 mr-2" />
                  <span>Collapse</span>
                </>
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={`w-full gap-3 px-2 ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex flex-col items-start text-sm overflow-hidden">
                      <span className="font-medium truncate w-full">{user.name || "User"}</span>
                      <span className="text-xs text-muted-foreground truncate w-full">
                        {user.email || ""}
                      </span>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={() => {
                    logoutMutation.mutate();
                    window.location.href = getLoginUrl();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-6">
            <SidebarTrigger />
            <div className="flex-1" />
            <NotificationCenter />
          </header>
          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
        </div>
      </SidebarProvider>
    </>
  );
}
