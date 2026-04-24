import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, FileText, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useDocumentStore } from "../hooks/useDocumentStore";
import type { DocumentPage, PdfSettings } from "../types/document";

// Client-side PDF generation using jsPDF
async function generatePdfBlob(
  pages: DocumentPage[],
  settings: PdfSettings,
): Promise<Blob> {
  const { jsPDF } = await import("jspdf");

  const pageSizes: Record<string, [number, number]> = {
    A4: [210, 297],
    Letter: [215.9, 279.4],
    Legal: [215.9, 355.6],
  };

  const [pw, ph] = pageSizes[settings.pageSize];
  const doc = new jsPDF({
    unit: "mm",
    format: [pw, ph],
    orientation: "portrait",
  });

  const sortedPages = [...pages].sort((a, b) => a.order - b.order);

  for (let i = 0; i < sortedPages.length; i++) {
    if (i > 0) doc.addPage([pw, ph], "portrait");
    const page = sortedPages[i];
    const src = page.processedDataUrl ?? page.originalDataUrl;

    await new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const iw = img.width;
        const ih = img.height;
        const aspect = iw / ih;

        // Fit image to page with 5mm margin
        const margin = 5;
        const maxW = pw - margin * 2;
        const maxH = ph - margin * 2;
        let drawW = maxW;
        let drawH = drawW / aspect;
        if (drawH > maxH) {
          drawH = maxH;
          drawW = drawH * aspect;
        }
        const x = margin + (maxW - drawW) / 2;
        const y = margin + (maxH - drawH) / 2;
        doc.addImage(
          src,
          "JPEG",
          x,
          y,
          drawW,
          drawH,
          undefined,
          settings.compression ? "FAST" : "NONE",
        );
        resolve();
      };
      img.src = src;
    });
  }

  return doc.output("blob");
}

export function GenerateStep() {
  const {
    pages,
    pdfSettings,
    setGeneratedPdf,
    setIsGenerating,
    isGenerating,
    generatedPdfBlob,
    setCurrentStep,
  } = useDocumentStore();

  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(!!generatedPdfBlob);
  const [hasGenerated, setHasGenerated] = useState(!!generatedPdfBlob);
  const autoStarted = useRef(false);

  const generate = useCallback(async () => {
    setIsGenerating(true);
    setDone(false);
    setProgress(0);

    try {
      const interval = setInterval(() => {
        setProgress((p) => Math.min(p + Math.random() * 15, 90));
      }, 200);

      const blob = await generatePdfBlob(pages, pdfSettings);

      clearInterval(interval);
      setProgress(100);
      setGeneratedPdf(blob);
      setDone(true);
      setHasGenerated(true);
      toast.success("PDF generated successfully!");
    } catch (err) {
      toast.error("Failed to generate PDF. Please try again.");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }, [pages, pdfSettings, setGeneratedPdf, setIsGenerating]);

  useEffect(() => {
    if (!autoStarted.current && !generatedPdfBlob && !isGenerating) {
      autoStarted.current = true;
      void generate();
    }
  }, [generatedPdfBlob, isGenerating, generate]);

  return (
    <div className="space-y-6" data-ocid="generate.page">
      <div className="workflow-card max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            4. Generate PDF
          </h2>
          <span className="text-sm text-muted-foreground">
            {pages.length} pages
          </span>
        </div>

        {/* Progress */}
        <div className="space-y-3" data-ocid="generate.progress_section">
          {isGenerating && (
            <div
              className="flex items-center gap-3"
              data-ocid="generate.loading_state"
            >
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <span className="text-sm text-foreground">Generating PDF…</span>
            </div>
          )}
          {done && (
            <div
              className="flex items-center gap-3"
              data-ocid="generate.success_state"
            >
              <CheckCircle2 className="w-5 h-5 text-accent" />
              <span className="text-sm font-medium text-foreground">
                PDF ready!
              </span>
            </div>
          )}

          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right">
            {Math.round(progress)}%
          </p>
        </div>

        {/* File info */}
        {done && generatedPdfBlob && (
          <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50 border border-border">
            <FileText className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">
                document.pdf
              </p>
              <p className="text-xs text-muted-foreground">
                {(generatedPdfBlob.size / 1024).toFixed(1)} KB · {pages.length}{" "}
                page{pages.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}

        {/* Retry */}
        {hasGenerated && !isGenerating && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={generate}
            data-ocid="generate.regenerate_button"
          >
            Regenerate
          </Button>
        )}
      </div>

      {/* Action bar */}
      <div
        className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
        data-ocid="generate.action_bar"
      >
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep("configure")}
          data-ocid="generate.prev_button"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back: Configure
        </Button>
        <div className="flex-1" />
        <Button
          type="button"
          disabled={!done}
          onClick={() => setCurrentStep("download")}
          data-ocid="generate.next_button"
        >
          Next: Download →
        </Button>
      </div>
    </div>
  );
}
