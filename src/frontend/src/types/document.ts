export type WorkflowStep =
  | "capture"
  | "review"
  | "configure"
  | "generate"
  | "download";

export interface DocumentPage {
  id: string;
  originalDataUrl: string;
  processedDataUrl: string | null;
  name: string;
  order: number;
  edgeDetected: boolean;
}

export interface PdfSettings {
  quality: number;
  pageSize: "A4" | "Letter" | "Legal";
  ocr: boolean;
  compression: boolean;
}

export interface DocumentStore {
  pages: DocumentPage[];
  currentStep: WorkflowStep;
  pdfSettings: PdfSettings;
  generatedPdfBlob: Blob | null;
  isGenerating: boolean;
  captureMode: "camera" | "upload";
}
