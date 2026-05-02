import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { compileJsxComponent } from "../lib/jsxCompiler";
import { ErrorBoundary } from "./ErrorBoundary";

type Props = {
  jsxCode: string;
  width: number;
  height: number;
};

export function PreviewRenderer({ jsxCode, width, height }: Props) {
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const stageRef = useRef<HTMLDivElement>(null);
  const { Component, error } = useMemo(() => {
    return compileJsxComponent(jsxCode);
  }, [jsxCode]);

  useEffect(() => {
    setRuntimeError(null);
  }, [jsxCode]);

  const safeWidth = Math.max(width, 1);
  const safeHeight = Math.max(height, 1);
  const aspectRatio = `${safeWidth} / ${safeHeight}`;

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }

    const updateScale = () => {
      const rect = stage.getBoundingClientRect();
      const availableWidth = Math.max(rect.width - 24, 1);
      const availableHeight = Math.max(rect.height - 24, 1);
      setScale(Math.max(0.02, Math.min(availableWidth / safeWidth, availableHeight / safeHeight)));
    };

    const observer = new ResizeObserver(updateScale);
    observer.observe(stage);
    updateScale();
    return () => observer.disconnect();
  }, [safeWidth, safeHeight]);

  return (
    <div className="preview-shell">
      <div className="preview-stage" ref={stageRef} style={{ aspectRatio }}>
        <div className="preview-viewport">
          {error ? (
            <div className="preview-error">{error}</div>
          ) : (
            <div
              className="preview-frame"
              style={{
                width: safeWidth * scale,
                height: safeHeight * scale
              }}
            >
              <div
                className="preview-canvas"
                style={{
                  width: safeWidth,
                  height: safeHeight,
                  transform: `scale(${scale})`
                }}
              >
                <ErrorBoundary onError={setRuntimeError}>
                  <Component />
                </ErrorBoundary>
              </div>
            </div>
          )}
        </div>
      </div>
      {runtimeError ? <p className="inline-error">{runtimeError}</p> : null}
    </div>
  );
}
