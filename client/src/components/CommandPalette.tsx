import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Command } from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  path: string;
  category: string;
  keywords: string[];
}

const commands: CommandItem[] = [
  { id: "dashboard", label: "Dashboard", path: "/", category: "Navigation", keywords: ["home", "overview"] },
  { id: "contacts", label: "Contacts", path: "/contacts", category: "CRM", keywords: ["people", "leads"] },
  { id: "companies", label: "Companies", path: "/companies", category: "CRM", keywords: ["accounts", "organizations"] },
  { id: "deals", label: "Deals", path: "/deals", category: "Sales", keywords: ["opportunities", "pipeline"] },
  { id: "kanban", label: "Deals Kanban", path: "/deals/kanban", category: "Sales", keywords: ["board", "pipeline"] },
  { id: "leads", label: "Leads", path: "/leads", category: "Sales", keywords: ["prospects"] },
  { id: "tasks", label: "Tasks", path: "/tasks", category: "Productivity", keywords: ["todo", "activities"] },
  { id: "ai-chat", label: "AI Assistant", path: "/ai-chat", category: "AI", keywords: ["chat", "assistant", "help"] },
  { id: "ai-insights", label: "AI Insights", path: "/ai-insights", category: "AI", keywords: ["forecast", "analytics", "predictions"] },
  { id: "collateral", label: "Collateral Generator", path: "/collateral", category: "AI", keywords: ["proposals", "content", "generate"] },
  { id: "icps", label: "ICPs", path: "/icps", category: "CRM", keywords: ["profiles", "ideal customer"] },
  { id: "goals", label: "Goals", path: "/goals", category: "Productivity", keywords: ["objectives", "targets"] },
  { id: "activities", label: "Activities", path: "/activities", category: "CRM", keywords: ["history", "log"] },
  { id: "articles", label: "Articles", path: "/articles", category: "Content", keywords: ["blog", "knowledge"] },
  { id: "email", label: "Email Sequences", path: "/email-sequences", category: "Marketing", keywords: ["campaigns", "automation"] },
  { id: "team", label: "Team", path: "/team", category: "Settings", keywords: ["members", "users"] },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [, setLocation] = useLocation();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const filteredCommands = commands.filter((cmd) => {
    const searchLower = search.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(searchLower) ||
      cmd.category.toLowerCase().includes(searchLower) ||
      cmd.keywords.some((k) => k.includes(searchLower))
    );
  });

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  const handleSelect = (path: string) => {
    setLocation(path);
    setOpen(false);
    setSearch("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 max-w-2xl">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Command className="h-5 w-5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search commands... (Ctrl+K)"
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
        </div>
        <div className="max-h-[400px] overflow-y-auto p-2">
          {Object.keys(groupedCommands).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No results found
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, items]) => (
              <div key={category} className="mb-4">
                <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {category}
                </div>
                <div className="space-y-1">
                  {items.map((cmd) => (
                    <button
                      key={cmd.id}
                      onClick={() => handleSelect(cmd.path)}
                      className="w-full text-left px-3 py-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <div className="font-medium">{cmd.label}</div>
                      <div className="text-xs text-muted-foreground">{cmd.path}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
          Press <kbd className="px-2 py-1 bg-background border border-border">Ctrl</kbd> +{" "}
          <kbd className="px-2 py-1 bg-background border border-border">K</kbd> to toggle
        </div>
      </DialogContent>
    </Dialog>
  );
}
