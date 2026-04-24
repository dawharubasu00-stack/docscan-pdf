import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, MoveDown, MoveUp, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useDocumentStore } from "../hooks/useDocumentStore";

export function ReviewStep() {
  const { pages, removePage, reorderPages, setCurrentStep } =
    useDocumentStore();

  const sortedPages = [...pages].sort((a, b) => a.order - b.order);

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    reorderPages(idx, idx - 1);
    toast("Page moved up");
  };

  const moveDown = (idx: number) => {
    if (idx === sortedPages.length - 1) return;
    reorderPages(idx, idx + 1);
    toast("Page moved down");
  };

  return (
    <div className="space-y-6" data-ocid="review.page">
      <div className="workflow-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">
            2. Review Pages
          </h2>
          <span className="text-sm text-muted-foreground">
            {pages.length} page{pages.length !== 1 ? "s" : ""}
          </span>
        </div>

        {pages.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 gap-3 text-center"
            data-ocid="review.empty_state"
          >
            <p className="text-muted-foreground text-sm">
              No pages captured yet.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep("capture")}
              data-ocid="review.back_button"
            >
              ← Go Back to Capture
            </Button>
          </div>
        ) : (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            data-ocid="review.grid"
          >
            {sortedPages.map((page, idx) => (
              <div
                key={page.id}
                className="group relative flex flex-col items-center gap-2"
                data-ocid={`review.item.${idx + 1}`}
              >
                <div className="relative w-full aspect-[3/4] rounded-md overflow-hidden border border-border bg-muted hover:border-primary transition-smooth">
                  <img
                    src={page.processedDataUrl ?? page.originalDataUrl}
                    alt={page.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-smooth flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      className="w-7 h-7 rounded-full bg-card text-foreground disabled:opacity-40 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-smooth"
                      aria-label="Move up"
                      data-ocid={`review.move_up.${idx + 1}`}
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        removePage(page.id);
                        toast.success("Page removed");
                      }}
                      className="w-7 h-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/80 transition-smooth"
                      aria-label={`Remove ${page.name}`}
                      data-ocid={`review.delete_button.${idx + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDown(idx)}
                      disabled={idx === sortedPages.length - 1}
                      className="w-7 h-7 rounded-full bg-card text-foreground disabled:opacity-40 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-smooth"
                      aria-label="Move down"
                      data-ocid={`review.move_down.${idx + 1}`}
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="text-center w-full">
                  <p className="text-xs font-medium text-foreground truncate">
                    {page.name}
                  </p>
                  {page.edgeDetected && (
                    <p className="text-xs text-accent">✓ Enhanced</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action bar */}
      <div
        className="flex flex-col sm:flex-row gap-3"
        data-ocid="review.action_bar"
      >
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep("capture")}
          data-ocid="review.prev_button"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back: Capture
        </Button>
        <div className="flex-1" />
        <Button
          type="button"
          disabled={pages.length === 0}
          onClick={() => setCurrentStep("configure")}
          data-ocid="review.next_button"
        >
          Next: Configure <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
