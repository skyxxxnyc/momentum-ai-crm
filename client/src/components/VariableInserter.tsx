import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Braces, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VariableInserterProps {
  onInsert: (variable: string) => void;
  trigger?: React.ReactNode;
}

export function VariableInserter({ onInsert, trigger }: VariableInserterProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: variables, isLoading } = trpc.emailVariables.list.useQuery();

  const filteredVariables = variables?.filter(
    (v) =>
      v.key.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleInsert = (placeholder: string) => {
    onInsert(placeholder);
    setOpen(false);
    setSearch("");
  };

  // Group variables by category
  const groupedVariables = filteredVariables?.reduce((acc, variable) => {
    let category = "Other";
    if (variable.key.startsWith("contact_")) category = "Contact";
    else if (variable.key.startsWith("company_")) category = "Company";
    else if (variable.key.startsWith("sender_")) category = "Sender";
    else if (variable.key.startsWith("current_")) category = "Dynamic";

    if (!acc[category]) acc[category] = [];
    acc[category].push(variable);
    return acc;
  }, {} as Record<string, typeof variables>);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Braces className="h-4 w-4 mr-2" />
            Insert Variable
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search variables..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading variables...
            </div>
          ) : !groupedVariables || Object.keys(groupedVariables).length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No variables found
            </div>
          ) : (
            <div className="p-2">
              {Object.entries(groupedVariables).map(([category, vars]) => (
                <div key={category} className="mb-4">
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                    {category}
                  </div>
                  <div className="space-y-1">
                    {vars?.map((variable) => (
                      <button
                        key={variable.key}
                        onClick={() => handleInsert(variable.placeholder)}
                        className="w-full text-left px-2 py-2 rounded-md hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                                {variable.placeholder}
                              </code>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {variable.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-3 border-t bg-muted/50">
          <p className="text-xs text-muted-foreground">
            Click a variable to insert it at the cursor position
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
