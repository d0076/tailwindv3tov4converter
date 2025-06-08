import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import {
  convertV3ToV4,
  convertV4ToV3,
  validateCss,
  sampleV3Data,
  sampleV4Data,
  type ConversionResult,
} from "@/lib/converter";
import {
  ArrowLeftRight,
  Copy,
  Check,
  AlertCircle,
  CheckCircle,
  FileText,
  Zap,
  Download,
  RefreshCw,
} from "lucide-react";

function AppContent() {
  const [inputCode, setInputCode] = useState("");
  const [outputCode, setOutputCode] = useState("");
  const [conversionMode, setConversionMode] = useState<"v3-to-v4" | "v4-to-v3">(
    "v3-to-v4"
  );
  const [conversionResult, setConversionResult] =
    useState<ConversionResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [inputCopied, setInputCopied] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  // Auto-convert with debounce
  useEffect(() => {
    if (!inputCode.trim()) {
      setOutputCode("");
      setConversionResult(null);
      setValidationErrors([]);
      setIsConverting(false);
      return;
    }

    setIsConverting(true);
    const timeout = setTimeout(() => {
      const errors = validateCss(inputCode);
      setValidationErrors(errors);

      const result =
        conversionMode === "v3-to-v4"
          ? convertV3ToV4(inputCode)
          : convertV4ToV3(inputCode);

      setConversionResult(result);
      setOutputCode(result.result);
      setIsConverting(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [inputCode, conversionMode]);

  const handleCopy = async () => {
    if (!outputCode) return;

    try {
      await navigator.clipboard.writeText(outputCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleCopyInput = async () => {
    if (!inputCode) return;

    try {
      await navigator.clipboard.writeText(inputCode);
      setInputCopied(true);
      setTimeout(() => setInputCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy input:", error);
    }
  };

  const loadSample = () => {
    const sample = conversionMode === "v3-to-v4" ? sampleV3Data : sampleV4Data;
    setInputCode(sample);
  };

  const swapConversion = () => {
    const newMode = conversionMode === "v3-to-v4" ? "v4-to-v3" : "v3-to-v4";
    setConversionMode(newMode);

    // Smart swap: only swap content if we have meaningful output
    if (outputCode && conversionResult?.success) {
      setInputCode(outputCode);
      setOutputCode("");
    }
  };

  const clearAll = () => {
    setInputCode("");
    setOutputCode("");
    setConversionResult(null);
    setValidationErrors([]);
  };

  const downloadOutput = () => {
    if (!outputCode) return;

    const blob = new Blob([outputCode], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tailwind-v${
      conversionMode === "v3-to-v4" ? "4" : "3"
    }-variables.css`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getConversionStats = () => {
    if (!conversionResult) return null;

    const lines = outputCode.split("\n").filter((line) => line.trim()).length;
    const vars = (outputCode.match(/--[\w-]+:/g) || []).length;

    return { lines, vars };
  };

  const stats = getConversionStats();

  return (
    <div className="max-h-dvh bg-gradient-to-br from-background via-background/80 to-muted/20">
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1" />
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                Tailwind CSS v3 → v4 Converter
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Convert CSS variables between Tailwind v3 (HSL) and v4 (OKLCH)
                for{" "}
                <span className="font-medium text-foreground">shadcn/ui</span>{" "}
                components
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              <ModeToggle />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={loadSample}
              className="gap-1"
            >
              <FileText className="h-4 w-4" />
              Load Sample
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Clear All
            </Button>
          </div>
        </header>

        {/* Conversion Mode Toggle */}
        <div className="max-w-md mx-auto mb-8">
          <div className="flex items-center justify-between p-1 bg-card rounded-lg border shadow-sm">
            <div className="flex-1 text-center">
              <Badge
                variant={
                  conversionMode === "v3-to-v4" ? "default" : "secondary"
                }
                className="w-full justify-center py-2"
              >
                Tailwind v3 (HSL)
              </Badge>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={swapConversion}
              className="mx-2 h-8 w-8 p-0 hover:bg-accent"
              title="Swap conversion direction"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>

            <div className="flex-1 text-center">
              <Badge
                variant={
                  conversionMode === "v4-to-v3" ? "default" : "secondary"
                }
                className="w-full justify-center py-2"
              >
                Tailwind v4 (OKLCH)
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        {stats && (
          <div className="max-w-2xl mx-auto mb-6 p-3 bg-card rounded-lg border">
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">
                  {stats.vars} variables converted
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">
                  {stats.lines} lines processed
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Main Converter */}
        <main className="grid lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Input</h2>
                <p className="text-sm text-muted-foreground">
                  Paste your{" "}
                  {conversionMode === "v3-to-v4" ? "v3 HSL" : "v4 OKLCH"} CSS
                  variables
                </p>
              </div>

              <div className="flex items-center gap-2">
                {validationErrors.length > 0 && (
                  <Badge variant="destructive" className="text-xs gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.length} Error
                    {validationErrors.length > 1 ? "s" : ""}
                  </Badge>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyInput}
                  disabled={!inputCode}
                  className="gap-1"
                >
                  {inputCopied ? (
                    <>
                      <Check className="h-3 w-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="relative">
              <Textarea
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder={`/* Paste your ${
                  conversionMode === "v3-to-v4" ? "Tailwind v3" : "Tailwind v4"
                } CSS variables here */
:root {
  --background: ${conversionMode === "v3-to-v4" ? "0 0% 100%" : "oklch(1 0 0)"};
  --foreground: ${
    conversionMode === "v3-to-v4"
      ? "222.2 84% 4.9%"
      : "oklch(0.141 0.005 285.823)"
  };
  /* ... more variables */
}`}
                className="min-h-[28rem] font-mono text-sm resize-none bg-background border-2 focus:border-primary overflow-y-auto"
              />

              {isConverting && (
                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-muted text-muted-foreground rounded-md text-xs">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Converting...
                </div>
              )}
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="font-medium text-destructive text-sm">
                    Validation Issues
                  </span>
                </div>
                <div className="text-xs text-destructive space-y-1 max-h-24 overflow-y-auto">
                  {validationErrors.slice(0, 5).map((error, i) => (
                    <div key={i} className="flex items-start gap-1">
                      <span className="text-destructive/60">•</span>
                      <span>{error}</span>
                    </div>
                  ))}
                  {validationErrors.length > 5 && (
                    <div className="text-destructive/80 italic">
                      + {validationErrors.length - 5} more issues...
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Output Panel */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Output
                </h2>
                <p className="text-sm text-muted-foreground">
                  Converted{" "}
                  {conversionMode === "v3-to-v4" ? "v4 OKLCH" : "v3 HSL"}{" "}
                  variables
                </p>
              </div>

              <div className="flex items-center gap-2">
                {conversionResult && (
                  <Badge
                    variant={
                      conversionResult.success ? "default" : "destructive"
                    }
                    className="text-xs gap-1"
                  >
                    {conversionResult.success ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <AlertCircle className="h-3 w-3" />
                    )}
                    {conversionResult.success ? "Success" : "Failed"}
                  </Badge>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadOutput}
                  disabled={!outputCode}
                  className="gap-1"
                >
                  <Download className="h-3 w-3" />
                  Download
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!outputCode}
                  className="gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Textarea
              value={outputCode}
              readOnly
              placeholder="/* Converted CSS variables will appear here automatically */
:root {
  /* Your converted variables will show up here */
}"
              className="min-h-[28rem] font-mono text-sm resize-none bg-muted/50 border-2 border-dashed overflow-y-auto"
            />

            {/* Conversion Errors */}
            {conversionResult && conversionResult.errors.length > 0 && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="font-medium text-yellow-800 dark:text-yellow-200 text-sm">
                    Conversion Warnings
                  </span>
                </div>
                <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1 max-h-24 overflow-y-auto">
                  {conversionResult.errors.slice(0, 3).map((error, i) => (
                    <div key={i} className="flex items-start gap-1">
                      <span className="text-yellow-500">•</span>
                      <span>{error}</span>
                    </div>
                  ))}
                  {conversionResult.errors.length > 3 && (
                    <div className="text-yellow-600 dark:text-yellow-400 italic">
                      + {conversionResult.errors.length - 3} more warnings...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Success Message */}
            {conversionResult?.success &&
              outputCode &&
              !conversionResult.errors.length && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium text-sm">
                      Conversion completed successfully! Ready to use in your
                      shadcn/ui project.
                    </span>
                  </div>
                </div>
              )}
          </section>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
