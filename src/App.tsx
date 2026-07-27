import { useCallback, useRef, useState } from 'react';
import { AppHeader, type Stage } from './components/AppHeader';
import { ToastProvider, useToast } from './components/ToastProvider';
import { ConfirmDialog } from './components/ConfirmDialog';
import { InputPage } from './pages/InputPage';
import { CandidatesPage } from './pages/CandidatesPage';
import { GeneratingPage } from './pages/GeneratingPage';
import { ResultPage } from './pages/ResultPage';
import { useLocalStorage, STORAGE_KEYS } from './hooks/useLocalStorage';
import { analyzeProducts, generateCandidate, N8nApiError } from './api/n8n';
import type { AnalyzeResponse, ApiError, GenerateResponse } from './types/api';

function toApiError(err: unknown): ApiError {
  if (err instanceof N8nApiError) return err.apiError;
  return { kind: 'UNKNOWN', message: 'Something unexpected went wrong.', details: String(err) };
}

function AppShell() {
  const { showToast } = useToast();

  const [linksText, setLinksText, clearLinksText] = useLocalStorage<string>(STORAGE_KEYS.lastLinks, '');
  const [analyzeResponse, setAnalyzeResponse, clearAnalyzeResponse] = useLocalStorage<AnalyzeResponse | null>(
    STORAGE_KEYS.candidateResponse,
    null,
  );
  const [selectedAsin, setSelectedAsin, clearSelectedAsin] = useLocalStorage<string | null>(
    STORAGE_KEYS.selectedAsin,
    null,
  );
  const [generateResult, setGenerateResult, clearGenerateResult] = useLocalStorage<GenerateResponse | null>(
    STORAGE_KEYS.generatedResult,
    null,
  );

  const [stage, setStage] = useState<Stage>(() => {
    if (generateResult) return 'result';
    if (analyzeResponse) return 'candidates';
    return 'input';
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const analyzeAbortRef = useRef<AbortController | null>(null);
  const generateAbortRef = useRef<AbortController | null>(null);
  const lastSubmittedLinksRef = useRef<string[]>([]);

  const runAnalyze = useCallback(
    async (links: string[]) => {
      if (isAnalyzing) return;
      lastSubmittedLinksRef.current = links;
      setError(null);
      setIsAnalyzing(true);

      const controller = new AbortController();
      analyzeAbortRef.current = controller;

      try {
        const response = await analyzeProducts(links, { signal: controller.signal });
        setAnalyzeResponse(response);
        setSelectedAsin(null);
        setGenerateResult(null);
        setStage('candidates');
        if (response.candidates.length > 0) {
          showToast(`Found ${response.candidates.length} safe candidate${response.candidates.length === 1 ? '' : 's'}.`, 'success');
        } else {
          showToast('No safe candidates were returned for these links.', 'info');
        }
      } catch (err) {
        const apiError = toApiError(err);
        if (apiError.kind !== 'ABORTED') {
          setError(apiError);
          showToast(apiError.message, 'error');
        }
      } finally {
        setIsAnalyzing(false);
        analyzeAbortRef.current = null;
      }
    },
    [isAnalyzing, setAnalyzeResponse, setGenerateResult, setSelectedAsin, showToast],
  );

  const handleCancelAnalyze = useCallback(() => {
    analyzeAbortRef.current?.abort();
    setIsAnalyzing(false);
  }, []);

  const runGenerate = useCallback(
    async (asin: string) => {
      if (isGenerating) return;
      setError(null);
      setIsGenerating(true);
      setStage('generating');

      const controller = new AbortController();
      generateAbortRef.current = controller;

      try {
        const response = await generateCandidate(asin, { signal: controller.signal });
        setGenerateResult(response);
        setStage('result');
        showToast('Design and listing generated successfully.', 'success');
      } catch (err) {
        const apiError = toApiError(err);
        setStage('candidates');
        if (apiError.kind !== 'ABORTED') {
          setError(apiError);
          showToast(apiError.message, 'error');
        }
      } finally {
        setIsGenerating(false);
        generateAbortRef.current = null;
      }
    },
    [isGenerating, setGenerateResult, showToast],
  );

  const handleCancelGenerate = useCallback(() => {
    generateAbortRef.current?.abort();
    setIsGenerating(false);
    setStage('candidates');
  }, []);

  const handleGenerateClick = useCallback(() => {
    if (!selectedAsin) return;
    void runGenerate(selectedAsin);
  }, [runGenerate, selectedAsin]);

  const handleRetryAnalyze = useCallback(() => {
    if (lastSubmittedLinksRef.current.length > 0) void runAnalyze(lastSubmittedLinksRef.current);
  }, [runAnalyze]);

  const handleRetryGenerate = useCallback(() => {
    if (selectedAsin) void runGenerate(selectedAsin);
  }, [runGenerate, selectedAsin]);

  const handleStartOver = useCallback(() => {
    setError(null);
    clearAnalyzeResponse();
    clearSelectedAsin();
    clearGenerateResult();
    setStage('input');
  }, [clearAnalyzeResponse, clearGenerateResult, clearSelectedAsin]);

  const handleGenerateAnother = useCallback(() => {
    setError(null);
    setSelectedAsin(null);
    clearGenerateResult();
    setStage('candidates');
  }, [clearGenerateResult, setSelectedAsin]);

  const handleBackToCandidates = useCallback(() => {
    setError(null);
    setStage('candidates');
  }, []);

  const handleClearSession = useCallback(() => {
    analyzeAbortRef.current?.abort();
    generateAbortRef.current?.abort();
    clearLinksText();
    clearAnalyzeResponse();
    clearSelectedAsin();
    clearGenerateResult();
    setError(null);
    setIsAnalyzing(false);
    setIsGenerating(false);
    setStage('input');
    setShowClearConfirm(false);
    showToast('Saved session cleared.', 'success');
  }, [clearAnalyzeResponse, clearGenerateResult, clearLinksText, clearSelectedAsin, showToast]);

  const candidates = analyzeResponse?.candidates ?? [];
  const selectedCandidate = candidates.find((c) => c.asin === selectedAsin) ?? null;

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader currentStage={stage} onClearSession={() => setShowClearConfirm(true)} />

      <main className="flex-1">
        {stage === 'input' && (
          <InputPage
            linksText={linksText}
            onLinksTextChange={setLinksText}
            onAnalyze={runAnalyze}
            isAnalyzing={isAnalyzing}
            onCancelAnalyze={handleCancelAnalyze}
            error={error}
            onDismissError={() => setError(null)}
            onRetry={handleRetryAnalyze}
          />
        )}

        {stage === 'candidates' && (
          <CandidatesPage
            candidates={candidates}
            selectedAsin={selectedAsin}
            onSelect={setSelectedAsin}
            onGenerate={handleGenerateClick}
            onStartOver={handleStartOver}
            error={error}
            onDismissError={() => setError(null)}
            onRetry={handleRetryGenerate}
          />
        )}

        {stage === 'generating' && <GeneratingPage candidate={selectedCandidate} onCancel={handleCancelGenerate} />}

        {stage === 'result' && generateResult && (
          <ResultPage
            result={generateResult}
            sourceCandidate={selectedCandidate}
            onGenerateAnother={handleGenerateAnother}
            onBackToCandidates={handleBackToCandidates}
            onNewAnalysis={handleStartOver}
            error={error}
            onDismissError={() => setError(null)}
          />
        )}
      </main>

      <ConfirmDialog
        open={showClearConfirm}
        title="Clear saved session?"
        description="This will remove your pasted links, candidate results, selection, and generated design from this browser. This cannot be undone."
        confirmLabel="Clear session"
        danger
        onConfirm={handleClearSession}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  );
}
