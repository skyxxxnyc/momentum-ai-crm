import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // Navigation
  { keys: ["Ctrl", "K"], description: "Open command palette", category: "Navigation" },
  { keys: ["G", "D"], description: "Go to Dashboard", category: "Navigation" },
  { keys: ["G", "C"], description: "Go to Contacts", category: "Navigation" },
  { keys: ["G", "O"], description: "Go to Companies", category: "Navigation" },
  { keys: ["G", "L"], description: "Go to Deals", category: "Navigation" },
  { keys: ["G", "P"], description: "Go to Pipeline", category: "Navigation" },
  { keys: ["G", "A"], description: "Go to AI Chat", category: "Navigation" },
  
  // Actions
  { keys: ["N"], description: "Create new (context-dependent)", category: "Actions" },
  { keys: ["E"], description: "Edit current item", category: "Actions" },
  { keys: ["S"], description: "Save changes", category: "Actions" },
  { keys: ["Esc"], description: "Cancel or close", category: "Actions" },
  
  // Help
  { keys: ["?"], description: "Show keyboard shortcuts", category: "Help" },
];

const KeyShortcut = ({ keys }: { keys: string[] }) => (
  <div className="flex items-center gap-1">
    {keys.map((key, index) => (
      <span key={index} className="flex items-center gap-1">
        <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded">
          {key}
        </kbd>
        {index < keys.length - 1 && <span className="text-muted-foreground">+</span>}
      </span>
    ))}
  </div>
);

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Open with "?" key
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Don't trigger if user is typing in an input
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
          return;
        }
        e.preventDefault();
        setIsOpen(true);
      }
      
      // Close with Escape
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isOpen]);

  const categories = Array.from(new Set(shortcuts.map((s) => s.category)));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate siaCRM faster
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {shortcuts
                  .filter((s) => s.category === category)
                  .map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded hover:bg-accent/50 transition-colors"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <KeyShortcut keys={shortcut.keys} />
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Press <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted border border-border rounded">?</kbd> anytime to open this dialog
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
