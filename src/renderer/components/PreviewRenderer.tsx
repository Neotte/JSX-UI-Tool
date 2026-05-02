import { useEffect, useMemo, useState } from "react";
import { compileJsxComponent } from "../lib/jsxCompiler";
import { ErrorBoundary } from "./ErrorBoundary";

type Props = {
  jsxCode: string;
  width: number;
  height: number;
};

export function PreviewRenderer({ jsxCode, width, height }: Props) {
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const { Component, error } = useMemo(() => {
    return compileJsxComponent(jsxCode);
  }, [jsxCode]);

  useEffect(() => {
    setRuntimeError(null);
  }, [jsxCode]);

  const aspectRatio = `${Math.max(width, 1)} / ${Math.max(height, 1)}`;

  return (
    <div className="preview-shell">
      <div className="preview-stage" style={{ aspectRatio }}>
        <div className="preview-canvas">
          {error ? (
            <div className="preview-error">{error}</div>
          ) : (
            <ErrorBoundary onError={setRuntimeError}>
              <Component />
            </ErrorBoundary>
          )}
        </div>
      </div>
      {runtimeError ? <p className="inline-error">{runtimeError}</p> : null}
    </div>
  );
}
