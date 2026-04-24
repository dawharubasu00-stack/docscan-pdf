import { Toaster } from "@/components/ui/sonner";
import { Layout } from "./components/Layout";
import { useDocumentStore } from "./hooks/useDocumentStore";

// Lazy-loaded step pages
import { CaptureStep } from "./pages/CaptureStep";
import { ConfigureStep } from "./pages/ConfigureStep";
import { DownloadStep } from "./pages/DownloadStep";
import { GenerateStep } from "./pages/GenerateStep";
import { ReviewStep } from "./pages/ReviewStep";

export default function App() {
  const { currentStep } = useDocumentStore();

  const renderStep = () => {
    switch (currentStep) {
      case "capture":
        return <CaptureStep />;
      case "review":
        return <ReviewStep />;
      case "configure":
        return <ConfigureStep />;
      case "generate":
        return <GenerateStep />;
      case "download":
        return <DownloadStep />;
      default:
        return <CaptureStep />;
    }
  };

  return (
    <Layout>
      {renderStep()}
      <Toaster position="bottom-right" richColors />
    </Layout>
  );
}
