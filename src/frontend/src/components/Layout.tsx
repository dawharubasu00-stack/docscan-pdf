import { ScanText } from "lucide-react";
import type { ReactNode } from "react";
import { useDocumentStore } from "../hooks/useDocumentStore";
import type { WorkflowStep } from "../types/document";
import { StepIndicator } from "./StepIndicator";

interface LayoutProps {
  children: ReactNode;
}

const stepOrder: WorkflowStep[] = [
  "capture",
  "review",
  "configure",
  "generate",
  "download",
];

export function Layout({ children }: LayoutProps) {
  const { currentStep, setCurrentStep, pages } = useDocumentStore();

  const currentIndex = stepOrder.indexOf(currentStep);
  const completedSteps = stepOrder.slice(0, currentIndex) as WorkflowStep[];

  const canNavigateTo = (step: WorkflowStep) => {
    const targetIndex = stepOrder.indexOf(step);
    if (targetIndex <= currentIndex) return true;
    if (step === "review" && pages.length > 0) return true;
    return false;
  };

  const handleStepClick = (step: WorkflowStep) => {
    if (canNavigateTo(step)) setCurrentStep(step);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header
        className="bg-card border-b border-border sticky top-0 z-40"
        data-ocid="header.panel"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2" data-ocid="header.logo">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <ScanText className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-lg text-foreground tracking-tight">
              DocuScan
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">
              {pages.length} page{pages.length !== 1 ? "s" : ""} captured
            </span>
          </div>
        </div>
      </header>

      {/* Step Indicator */}
      <div className="bg-muted/40 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <StepIndicator
            currentStep={currentStep}
            onStepClick={handleStepClick}
            completedSteps={completedSteps}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-background" data-ocid="main.panel">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</div>
      </main>

      {/* Footer */}
      <footer
        className="bg-card border-t border-border py-4"
        data-ocid="footer.panel"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== "undefined" ? window.location.hostname : "",
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline transition-colors duration-200"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
