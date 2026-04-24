import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useDocumentStore } from "../hooks/useDocumentStore";

export function DownloadStep() {
  const { generatedPdfBlob, pages, clearDocument, setCurrentStep } =
    useDocumentStore();
  const [filename, setFilename] = useState("document");
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    if (!generatedPdfBlob) return;
    const url = URL.createObjectURL(generatedPdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename || "document"}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    toast.success("PDF downloaded!");
  };

  const handleNewDocument = () => {
    clearDocument();
  };

  if (!generatedPdfBlob) {
    return (
      <div
        className="workflow-card max-w-xl mx-auto text-center py-12 space-y-4"
        data-ocid="download.error_state"
      >
        <p className="text-muted-foreground text-sm">No PDF generated yet.</p>
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep("generate")}
          data-ocid="download.back_button"
        >
          ← Go Back to Generate
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-ocid="download.page">
      <div className="workflow-card max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            5. Download PDF
          </h2>
          {downloaded && (
            <div className="flex items-center gap-1 text-sm text-accent">
              <CheckCircle2 className="w-4 h-4" />
              Downloaded
            </div>
          )}
        </div>

        {/* File preview card */}
        <div className="flex items-center gap-4 p-4 rounded-md bg-muted/40 border border-border">
          <div className="w-12 h-16 rounded bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {filename}.pdf
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {(generatedPdfBlob.size / 1024).toFixed(1)} KB · {pages.length}{" "}
              page{pages.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Filename */}
        <div className="space-y-2">
          <Label htmlFor="filename" className="text-sm font-medium">
            File Name
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="document"
              className="flex-1"
              data-ocid="download.filename.input"
            />
            <span className="text-sm text-muted-foreground">.pdf</span>
          </div>
        </div>

        {/* Download button */}
        <Button
          type="button"
          size="lg"
          className="w-full text-base font-semibold"
          onClick={handleDownload}
          data-ocid="download.primary_button"
        >
          <Download className="w-5 h-5 mr-2" />
          Download PDF
        </Button>

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground text-center mb-4">
            Your PDF was generated entirely in your browser. No data was sent to
            any server.
          </p>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleNewDocument}
            data-ocid="download.new_document_button"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Scan Another Document
          </Button>
        </div>
      </div>

      {/* Action bar */}
      <div
        className="flex justify-start max-w-xl mx-auto"
        data-ocid="download.action_bar"
      >
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep("generate")}
          data-ocid="download.prev_button"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back: Generate
        </Button>
      </div>
    </div>
  );
}
