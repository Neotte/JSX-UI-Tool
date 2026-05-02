import React from "react";
import ReactDOM from "react-dom/client";
import { compileJsxComponent } from "./lib/jsxCompiler";

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement!);

window.__renderExport = ({ id, jsxCode, width, height, mode = "canvas" }) => {
  try {
    document.documentElement.style.width = `${width}px`;
    document.documentElement.style.height = `${height}px`;
    document.body.style.width = `${width}px`;
    document.body.style.height = `${height}px`;
    rootElement!.style.width = `${width}px`;
    rootElement!.style.height = `${height}px`;

    const { Component, error } = compileJsxComponent(jsxCode);
    if (error) {
      window.exportBridge.ready({ id, ok: false, error });
      return;
    }

    root.render(
      <React.StrictMode>
        <div
          id="export-frame"
          style={{
            width,
            height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            background: "transparent"
          }}
        >
          <div id="export-subject" style={{ display: "inline-block" }}>
            <Component />
          </div>
        </div>
      </React.StrictMode>
    );

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const subject = document.getElementById("export-subject");
        const rect = subject?.getBoundingClientRect();
        const bounds = rect
          ? {
              x: Math.max(0, Math.floor(rect.left)),
              y: Math.max(0, Math.floor(rect.top)),
              width: Math.max(1, Math.ceil(rect.width)),
              height: Math.max(1, Math.ceil(rect.height))
            }
          : undefined;
        window.exportBridge.ready({ id, ok: true, bounds: mode === "crop" ? bounds : undefined });
      });
    });
  } catch (error) {
    window.exportBridge.ready({
      id,
      ok: false,
      error: error instanceof Error ? error.message : "PNG 렌더링 중 오류가 발생했습니다."
    });
  }
};
