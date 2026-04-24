import { Button } from "@/components/ui/button";
import { GripVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import { useDocumentStore } from "../hooks/useDocumentStore";

export function PageThumbnails() {
  const { pages, removePage, reorderPages } = useDocumentStore();
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  if (pages.length === 0) {
    return (
      <div
        className="workflow-card min-h-40 flex flex-col items-center justify-center text-center gap-2"
        data-ocid="pages.empty_state"
      >
        <p className="text-sm font-medium text-foreground">Document Pages</p>
        <p className="text-xs text-muted-foreground">
          No pages yet. Capture or upload to begin.
        </p>
      </div>
    );
  }

  return (
    <div className="workflow-card" data-ocid="pages.panel">
      <p className="text-sm font-semibold text-foreground mb-3">
        Document Pages
        <span className="ml-2 text-xs text-muted-foreground font-normal">
          ({pages.length})
        </span>
      </p>
      <div className="space-y-2" data-ocid="pages.list">
        {pages
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((page, idx) => (
            <div
              key={page.id}
              draggable
              onDragStart={() => setDragIdx(idx)}
              onDragOver={(e) => {
                e.preventDefault();
                setOverIdx(idx);
              }}
              onDrop={() => {
                if (dragIdx !== null && dragIdx !== idx)
                  reorderPages(dragIdx, idx);
                setDragIdx(null);
                setOverIdx(null);
              }}
              onDragEnd={() => {
                setDragIdx(null);
                setOverIdx(null);
              }}
              className={[
                "flex items-center gap-2 p-2 rounded-md border cursor-grab active:cursor-grabbing transition-smooth",
                overIdx === idx && dragIdx !== idx
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:bg-muted/30",
              ].join(" ")}
              data-ocid={`pages.item.${idx + 1}`}
            >
              <GripVertical
                className="w-4 h-4 text-muted-foreground shrink-0"
                data-ocid={`pages.drag_handle.${idx + 1}`}
              />
              <div className="w-10 h-14 rounded overflow-hidden bg-muted shrink-0 border border-border">
                <img
                  src={page.processedDataUrl ?? page.originalDataUrl}
                  alt={page.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate text-foreground">
                  {page.name}
                </p>
                {page.edgeDetected && (
                  <span className="text-xs text-accent">✓ Enhanced</span>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="w-7 h-7 text-muted-foreground hover:text-destructive shrink-0"
                onClick={() => removePage(page.id)}
                aria-label={`Remove ${page.name}`}
                data-ocid={`pages.delete_button.${idx + 1}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
      </div>
    </div>
  );
}
