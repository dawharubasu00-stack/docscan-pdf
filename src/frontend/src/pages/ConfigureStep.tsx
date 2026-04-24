import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useDocumentStore } from "../hooks/useDocumentStore";

export function ConfigureStep() {
  const { pdfSettings, updatePdfSettings, pages, setCurrentStep } =
    useDocumentStore();

  return (
    <div className="space-y-6" data-ocid="configure.page">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PDF Settings */}
        <div className="workflow-card space-y-6">
          <h2 className="text-lg font-semibold text-foreground">
            3. Configure PDF
          </h2>

          {/* Quality */}
          <div className="space-y-3" data-ocid="configure.quality_section">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium" htmlFor="quality-slider">
                PDF Quality
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  {pdfSettings.quality >= 90
                    ? "High"
                    : pdfSettings.quality >= 60
                      ? "Medium"
                      : "Low"}
                </span>
              </Label>
              <span className="text-sm font-semibold text-primary">
                {pdfSettings.quality}%
              </span>
            </div>
            <input
              id="quality-slider"
              type="range"
              min={30}
              max={100}
              step={5}
              value={pdfSettings.quality}
              onChange={(e) =>
                updatePdfSettings({ quality: Number(e.target.value) })
              }
              className="w-full h-2 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
              data-ocid="configure.quality.input"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Smaller file</span>
              <span>Better quality</span>
            </div>
          </div>

          {/* Page Size */}
          <div className="space-y-2" data-ocid="configure.page_size_section">
            <Label className="text-sm font-medium">Page Size</Label>
            <Select
              value={pdfSettings.pageSize}
              onValueChange={(v) =>
                updatePdfSettings({ pageSize: v as "A4" | "Letter" | "Legal" })
              }
            >
              <SelectTrigger data-ocid="configure.page_size.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A4">A4 (210 × 297 mm)</SelectItem>
                <SelectItem value="Letter">Letter (8.5 × 11 in)</SelectItem>
                <SelectItem value="Legal">Legal (8.5 × 14 in)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Optimization toggles */}
          <div className="space-y-4" data-ocid="configure.optimization_section">
            <p className="text-sm font-medium text-foreground">Optimization</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">OCR</p>
                <p className="text-xs text-muted-foreground">
                  Optimize layout for text recognition
                </p>
              </div>
              <Switch
                checked={pdfSettings.ocr}
                onCheckedChange={(v) => updatePdfSettings({ ocr: v })}
                data-ocid="configure.ocr.switch"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">File Compression</p>
                <p className="text-xs text-muted-foreground">
                  Reduce file size without visible loss
                </p>
              </div>
              <Switch
                checked={pdfSettings.compression}
                onCheckedChange={(v) => updatePdfSettings({ compression: v })}
                data-ocid="configure.compression.switch"
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div
          className="workflow-card space-y-4"
          data-ocid="configure.summary_panel"
        >
          <h3 className="text-base font-semibold text-foreground">Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Pages</span>
              <span className="font-medium text-foreground">
                {pages.length}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Page Size</span>
              <span className="font-medium text-foreground">
                {pdfSettings.pageSize}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Quality</span>
              <span className="font-medium text-foreground">
                {pdfSettings.quality}%
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">OCR</span>
              <span
                className={`font-medium ${pdfSettings.ocr ? "text-accent" : "text-muted-foreground"}`}
              >
                {pdfSettings.ocr ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Compression</span>
              <span
                className={`font-medium ${pdfSettings.compression ? "text-accent" : "text-muted-foreground"}`}
              >
                {pdfSettings.compression ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-md bg-primary/10 border border-primary/20">
            <p className="text-xs text-primary font-medium">
              All processing happens in your browser — your documents are never
              uploaded to a server.
            </p>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div
        className="flex flex-col sm:flex-row gap-3"
        data-ocid="configure.action_bar"
      >
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep("review")}
          data-ocid="configure.prev_button"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back: Review
        </Button>
        <div className="flex-1" />
        <Button
          type="button"
          onClick={() => setCurrentStep("generate")}
          data-ocid="configure.next_button"
        >
          Next: Generate <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
