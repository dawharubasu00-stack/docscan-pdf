import { Check } from "lucide-react";
import type { WorkflowStep } from "../types/document";

interface Step {
  id: WorkflowStep;
  label: string;
  number: number;
}

const STEPS: Step[] = [
  { id: "capture", label: "Capture", number: 1 },
  { id: "review", label: "Review", number: 2 },
  { id: "configure", label: "Configure", number: 3 },
  { id: "generate", label: "Generate", number: 4 },
  { id: "download", label: "Download", number: 5 },
];

const stepOrder: WorkflowStep[] = [
  "capture",
  "review",
  "configure",
  "generate",
  "download",
];

interface StepIndicatorProps {
  currentStep: WorkflowStep;
  onStepClick?: (step: WorkflowStep) => void;
  completedSteps?: WorkflowStep[];
}

export function StepIndicator({
  currentStep,
  onStepClick,
  completedSteps = [],
}: StepIndicatorProps) {
  const currentIndex = stepOrder.indexOf(currentStep);

  return (
    <div className="workflow-card" data-ocid="step_indicator.panel">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
        Workflow Progress
      </p>
      <div className="flex items-center gap-0 overflow-x-auto pb-1">
        {STEPS.map((step, idx) => {
          const isActive = step.id === currentStep;
          const isComplete =
            idx < currentIndex || completedSteps.includes(step.id);
          const isClickable = !!onStepClick && (isComplete || isActive);

          return (
            <div key={step.id} className="flex items-center flex-1 min-w-0">
              <button
                type="button"
                data-ocid={`step_indicator.${step.id}.tab`}
                onClick={() => isClickable && onStepClick?.(step.id)}
                disabled={!isClickable}
                className={[
                  "flex flex-col items-center gap-1 shrink-0 group",
                  isClickable ? "cursor-pointer" : "cursor-default",
                ].join(" ")}
                aria-label={`Step ${step.number}: ${step.label}`}
                aria-current={isActive ? "step" : undefined}
              >
                <span
                  className={[
                    "step-badge transition-smooth",
                    isActive
                      ? "step-active"
                      : isComplete
                        ? "step-complete"
                        : "step-inactive",
                  ].join(" ")}
                >
                  {isComplete ? (
                    <Check className="w-4 h-4" strokeWidth={2.5} />
                  ) : (
                    step.number
                  )}
                </span>
                <span
                  className={[
                    "text-xs font-medium whitespace-nowrap hidden sm:block transition-smooth",
                    isActive
                      ? "text-primary"
                      : isComplete
                        ? "text-accent"
                        : "text-muted-foreground",
                  ].join(" ")}
                >
                  {step.number}. {step.label.toUpperCase()}
                </span>
              </button>
              {idx < STEPS.length - 1 && (
                <div className="flex-1 mx-2 h-px relative min-w-4">
                  <div className="absolute inset-0 bg-border" />
                  <div
                    className="absolute inset-0 bg-accent transition-all duration-500 ease-out origin-left"
                    style={{ transform: `scaleX(${isComplete ? 1 : 0})` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
