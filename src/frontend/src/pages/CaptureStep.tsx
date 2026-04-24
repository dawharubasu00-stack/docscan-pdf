import { Button } from "@/components/ui/button";
import { AlertCircle, Camera, Upload, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PageThumbnails } from "../components/PageThumbnails";
import { useDocumentStore } from "../hooks/useDocumentStore";

export function CaptureStep() {
  const { addPage, pages, setCurrentStep, captureMode, setCaptureMode } =
    useDocumentStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const edgeCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [edgePreviewUrl, setEdgePreviewUrl] = useState<string | null>(null);

  // Edge detection using Sobel operator
  const applyEdgeDetection = useCallback((imageData: ImageData): ImageData => {
    const src = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const dst = new Uint8ClampedArray(src.length);

    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0;
        let gy = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            const gray =
              0.299 * src[idx] + 0.587 * src[idx + 1] + 0.114 * src[idx + 2];
            const ki = (ky + 1) * 3 + (kx + 1);
            gx += gray * sobelX[ki];
            gy += gray * sobelY[ki];
          }
        }
        const mag = Math.min(255, Math.sqrt(gx * gx + gy * gy));
        const i = (y * width + x) * 4;
        dst[i] = mag;
        dst[i + 1] = mag;
        dst[i + 2] = mag;
        dst[i + 3] = 255;
      }
    }
    return new ImageData(dst, width, height);
  }, []);

  // Create document scan effect (white background, higher contrast)
  const applyScanEffect = useCallback((canvas: HTMLCanvasElement): string => {
    const ctx = canvas.getContext("2d")!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Increase contrast and brightness to simulate scanned doc
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      // Threshold: dark pixels stay dark, light pixels go white
      const val = avg > 180 ? 255 : avg < 80 ? 0 : Math.round(avg * 1.4 - 50);
      const clamped = Math.min(255, Math.max(0, val));
      data[i] = clamped;
      data[i + 1] = clamped;
      data[i + 2] = clamped;
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.9);
  }, []);

  // Generate edge preview from dataUrl
  const generateEdgePreview = useCallback(
    (dataUrl: string) => {
      const img = new Image();
      img.onload = () => {
        const ec = edgeCanvasRef.current;
        if (!ec) return;
        ec.width = img.width;
        ec.height = img.height;
        const ctx = ec.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, ec.width, ec.height);
        const edged = applyEdgeDetection(imageData);

        // Overlay green edges on original
        const srcData = imageData.data;
        const edgeData = edged.data;
        for (let i = 0; i < srcData.length; i += 4) {
          if (edgeData[i] > 50) {
            srcData[i] = 0;
            srcData[i + 1] = 220;
            srcData[i + 2] = 80;
            srcData[i + 3] = 255;
          }
        }
        ctx.putImageData(new ImageData(srcData, ec.width, ec.height), 0, 0);
        setEdgePreviewUrl(ec.toDataURL("image/jpeg", 0.85));
      };
      img.src = dataUrl;
    },
    [applyEdgeDetection],
  );

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      setCaptureMode("camera");
    } catch {
      setCameraError(
        "Camera access denied. Please allow camera permission and try again.",
      );
    }
  }, [setCaptureMode]);

  const stopCamera = useCallback(() => {
    const tracks = streamRef.current?.getTracks() ?? [];
    for (const track of tracks) track.stop();
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  const captureFromCamera = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);

    const originalDataUrl = canvas.toDataURL("image/jpeg", 0.95);
    const processedDataUrl = applyScanEffect(canvas);

    generateEdgePreview(originalDataUrl);

    addPage({
      originalDataUrl,
      processedDataUrl,
      name: `Page ${pages.length + 1}`,
      edgeDetected: true,
    });

    toast.success(`Page ${pages.length + 1} captured!`);
  }, [addPage, pages.length, applyScanEffect, generateEdgePreview]);

  const handleFileUpload = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      let i = 0;
      for (const file of Array.from(files)) {
        const reader = new FileReader();
        const idx = i;
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          const img = new Image();
          img.onload = () => {
            const tmpCanvas = document.createElement("canvas");
            tmpCanvas.width = img.width;
            tmpCanvas.height = img.height;
            const ctx = tmpCanvas.getContext("2d")!;
            ctx.drawImage(img, 0, 0);
            const processedDataUrl = applyScanEffect(tmpCanvas);
            generateEdgePreview(dataUrl);
            addPage({
              originalDataUrl: dataUrl,
              processedDataUrl,
              name: `Page ${pages.length + 1 + idx}`,
              edgeDetected: true,
            });
            toast.success(`${file.name} added!`);
          };
          img.src = dataUrl;
        };
        reader.readAsDataURL(file);
        i++;
      }
    },
    [addPage, pages.length, applyScanEffect, generateEdgePreview],
  );

  useEffect(() => () => stopCamera(), [stopCamera]);

  return (
    <div className="space-y-6" data-ocid="capture.page">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Camera/Upload Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="workflow-card">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              1. Capture Documents
            </h2>

            {/* Mode Toggle */}
            <div className="flex gap-2 mb-4" data-ocid="capture.mode_toggle">
              <Button
                type="button"
                variant={captureMode === "upload" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  stopCamera();
                  setCaptureMode("upload");
                }}
                data-ocid="capture.upload_toggle"
              >
                <Upload className="w-4 h-4 mr-1.5" /> Upload
              </Button>
              <Button
                type="button"
                variant={captureMode === "camera" ? "default" : "outline"}
                size="sm"
                onClick={startCamera}
                data-ocid="capture.camera_toggle"
              >
                <Camera className="w-4 h-4 mr-1.5" /> Camera
              </Button>
            </div>

            {/* Camera error */}
            {cameraError && (
              <div
                className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3 mb-4"
                data-ocid="capture.camera.error_state"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Camera Preview */}
            {captureMode === "camera" && (
              <div className="relative bg-foreground/5 rounded-lg overflow-hidden aspect-video border border-border">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                {!cameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <Camera className="w-12 h-12 opacity-30" />
                    <p className="text-sm">Camera not started</p>
                  </div>
                )}
                {/* Corner guides */}
                {cameraActive && (
                  <div className="absolute inset-6 pointer-events-none">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-sm" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-sm" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-sm" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-sm" />
                  </div>
                )}
                <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-primary-foreground bg-foreground/60 px-2 py-1 rounded-full">
                  {cameraActive ? "Camera preview" : "Starting..."}
                </p>
              </div>
            )}

            {/* Upload dropzone */}
            {captureMode === "upload" && (
              <button
                type="button"
                className="w-full border-2 border-dashed border-border rounded-lg p-10 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-smooth"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileUpload(e.dataTransfer.files);
                }}
                data-ocid="capture.dropzone"
              >
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">
                  Drop images here or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports JPG, PNG, WEBP
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  data-ocid="capture.file_input"
                />
              </button>
            )}

            {/* Edge Detection Preview */}
            {edgePreviewUrl && (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  Edge Detection Preview
                </p>
                <div className="rounded-lg overflow-hidden border border-border bg-foreground/5">
                  <img
                    src={edgePreviewUrl}
                    alt="Edge detection preview"
                    className="w-full object-contain max-h-52"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Page Thumbnails */}
        <div className="space-y-4">
          <PageThumbnails />
        </div>
      </div>

      {/* Canvas (hidden) */}
      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={edgeCanvasRef} className="hidden" />

      {/* Action Bar */}
      <div
        className="flex flex-col sm:flex-row gap-3"
        data-ocid="capture.action_bar"
      >
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => {
            if (captureMode === "camera" && cameraActive) {
              captureFromCamera();
            } else {
              fileInputRef.current?.click();
            }
          }}
          data-ocid="capture.add_page_button"
        >
          {captureMode === "camera" && cameraActive ? (
            <>
              <Camera className="w-4 h-4 mr-2" /> Add Page
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" /> Add Page
            </>
          )}
        </Button>
        {captureMode === "camera" && cameraActive && (
          <Button
            type="button"
            className="flex-1 bg-primary text-primary-foreground"
            onClick={captureFromCamera}
            data-ocid="capture.capture_button"
          >
            <Camera className="w-4 h-4 mr-2" /> Capture Page
          </Button>
        )}
        <Button
          type="button"
          className="flex-1"
          disabled={pages.length === 0}
          onClick={() => setCurrentStep("review")}
          data-ocid="capture.next_button"
        >
          → Next: Review
        </Button>
      </div>
    </div>
  );
}
