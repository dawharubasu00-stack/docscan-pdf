import { create } from "zustand";
import type {
  DocumentPage,
  DocumentStore,
  PdfSettings,
  WorkflowStep,
} from "../types/document";

interface DocumentActions {
  addPage: (page: Omit<DocumentPage, "id" | "order">) => void;
  removePage: (id: string) => void;
  reorderPages: (fromIndex: number, toIndex: number) => void;
  setProcessedDataUrl: (id: string, dataUrl: string) => void;
  setCurrentStep: (step: WorkflowStep) => void;
  updatePdfSettings: (settings: Partial<PdfSettings>) => void;
  setGeneratedPdf: (blob: Blob | null) => void;
  setIsGenerating: (value: boolean) => void;
  setCaptureMode: (mode: "camera" | "upload") => void;
  clearDocument: () => void;
}

const defaultPdfSettings: PdfSettings = {
  quality: 90,
  pageSize: "A4",
  ocr: true,
  compression: true,
};

const initialState: DocumentStore = {
  pages: [],
  currentStep: "capture",
  pdfSettings: defaultPdfSettings,
  generatedPdfBlob: null,
  isGenerating: false,
  captureMode: "upload",
};

export const useDocumentStore = create<DocumentStore & DocumentActions>(
  (set) => ({
    ...initialState,

    addPage: (page) =>
      set((state) => ({
        pages: [
          ...state.pages,
          {
            ...page,
            id: `page-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            order: state.pages.length,
          },
        ],
      })),

    removePage: (id) =>
      set((state) => ({
        pages: state.pages
          .filter((p) => p.id !== id)
          .map((p, i) => ({ ...p, order: i })),
      })),

    reorderPages: (fromIndex, toIndex) =>
      set((state) => {
        const pages = [...state.pages];
        const [moved] = pages.splice(fromIndex, 1);
        pages.splice(toIndex, 0, moved);
        return { pages: pages.map((p, i) => ({ ...p, order: i })) };
      }),

    setProcessedDataUrl: (id, dataUrl) =>
      set((state) => ({
        pages: state.pages.map((p) =>
          p.id === id
            ? { ...p, processedDataUrl: dataUrl, edgeDetected: true }
            : p,
        ),
      })),

    setCurrentStep: (step) => set({ currentStep: step }),

    updatePdfSettings: (settings) =>
      set((state) => ({
        pdfSettings: { ...state.pdfSettings, ...settings },
      })),

    setGeneratedPdf: (blob) => set({ generatedPdfBlob: blob }),

    setIsGenerating: (value) => set({ isGenerating: value }),

    setCaptureMode: (mode) => set({ captureMode: mode }),

    clearDocument: () => set({ ...initialState }),
  }),
);
