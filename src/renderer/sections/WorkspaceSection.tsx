import { Download } from "lucide-react";
import { validateResolution } from "../../shared/validation";
import type { ExportMode } from "../../shared/types";
import { ExportModal } from "../components/ExportModal";
import { PreviewRenderer } from "../components/PreviewRenderer";

type Props = {
  jsxCode: string;
  width: number;
  height: number;
  currentLoadoutName: string | null;
  exportName: string;
  exportMode: ExportMode;
  isExportOpen: boolean;
  isBusy: boolean;
  message: string | null;
  onJsxChange: (code: string) => void;
  onWidthChange: (width: number) => void;
  onHeightChange: (height: number) => void;
  onExportNameChange: (name: string) => void;
  onExportModeChange: (mode: ExportMode) => void;
  onOpenExport: () => void;
  onCloseExport: () => void;
  onConfirmExport: () => void;
};

export function WorkspaceSection({
  jsxCode,
  width,
  height,
  currentLoadoutName,
  exportName,
  exportMode,
  isExportOpen,
  isBusy,
  message,
  onJsxChange,
  onWidthChange,
  onHeightChange,
  onExportNameChange,
  onExportModeChange,
  onOpenExport,
  onCloseExport,
  onConfirmExport
}: Props) {
  const resolutionError = validateResolution(width, height);

  return (
    <section className="workspace-grid">
      <div className="editor-pane">
        <div className="section-heading">
          <div>
            <h1>Local JSX Asset Designer</h1>
            <p>{currentLoadoutName ? `로드아웃: ${currentLoadoutName}` : "새 작업"}</p>
          </div>
          <button className="primary-button" type="button" disabled={Boolean(resolutionError) || isBusy} onClick={onOpenExport}>
            <Download size={16} />
            내보내기
          </button>
        </div>
        <textarea
          className="code-editor"
          spellCheck={false}
          value={jsxCode}
          onChange={(event) => onJsxChange(event.target.value)}
        />
      </div>

      <aside className="side-pane">
        <div className="tool-panel">
          <h2>해상도</h2>
          <div className="resolution-grid">
            <label className="field">
              <span>width</span>
              <input type="number" min={1} max={8192} value={width} onChange={(event) => onWidthChange(Number(event.target.value))} />
            </label>
            <label className="field">
              <span>height</span>
              <input type="number" min={1} max={8192} value={height} onChange={(event) => onHeightChange(Number(event.target.value))} />
            </label>
          </div>
          {resolutionError ? <p className="inline-error">{resolutionError}</p> : null}
          {message ? <p className="inline-status">{message}</p> : null}
        </div>

        <div className="preview-panel">
          <div className="panel-title-row">
            <h2>Preview</h2>
            <span>{width} x {height}</span>
          </div>
          <PreviewRenderer jsxCode={jsxCode} width={width} height={height} />
        </div>
      </aside>

      {isExportOpen ? (
        <ExportModal
          name={exportName}
          mode={exportMode}
          isBusy={isBusy}
          onNameChange={onExportNameChange}
          onModeChange={onExportModeChange}
          onCancel={onCloseExport}
          onConfirm={onConfirmExport}
        />
      ) : null}
    </section>
  );
}
