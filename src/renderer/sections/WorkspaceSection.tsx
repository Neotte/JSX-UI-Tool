import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Download, Search, X } from "lucide-react";
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
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMatchIndex, setActiveMatchIndex] = useState(-1);
  const matches = useMemo(() => {
    const term = searchTerm.trim();
    if (!term) {
      return [];
    }

    const source = jsxCode.toLocaleLowerCase();
    const query = term.toLocaleLowerCase();
    const nextMatches: number[] = [];
    let index = source.indexOf(query);

    while (index !== -1) {
      nextMatches.push(index);
      index = source.indexOf(query, index + query.length);
    }

    return nextMatches;
  }, [jsxCode, searchTerm]);

  useEffect(() => {
    if (!searchTerm.trim() || matches.length === 0) {
      setActiveMatchIndex(-1);
      return;
    }

    setActiveMatchIndex((current) => {
      if (current >= 0 && current < matches.length) {
        return current;
      }
      return 0;
    });
  }, [matches.length, searchTerm]);

  useEffect(() => {
    if (activeMatchIndex < 0 || activeMatchIndex >= matches.length) {
      return;
    }

    jumpToMatch(matches[activeMatchIndex]);
  }, [activeMatchIndex, matches, searchTerm]);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if (isExportOpen || !(event.ctrlKey || event.metaKey) || event.key.toLocaleLowerCase() !== "f") {
        return;
      }

      event.preventDefault();
      openSearch();
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [activeMatchIndex, isExportOpen, jsxCode, matches, searchTerm]);

  function openSearch() {
    const editor = editorRef.current;
    if (editor && editor.selectionStart !== editor.selectionEnd) {
      const selectedText = editor.value.slice(editor.selectionStart, editor.selectionEnd);
      if (selectedText && !selectedText.includes("\n")) {
        setSearchTerm(selectedText);
      }
    }

    setSearchOpen(true);
    window.setTimeout(() => {
      searchInputRef.current?.select();
      if (matches.length > 0 && activeMatchIndex >= 0) {
        jumpToMatch(matches[activeMatchIndex]);
      }
    }, 0);
  }

  function closeSearch() {
    setSearchOpen(false);
    editorRef.current?.focus();
  }

  function jumpToMatch(index: number) {
    const editor = editorRef.current;
    const term = searchTerm.trim();
    if (!editor || !term) {
      return;
    }

    const lineIndex = jsxCode.slice(0, index).split("\n").length - 1;
    const lineHeight = Number.parseFloat(window.getComputedStyle(editor).lineHeight) || 20;
    editor.scrollTop = Math.max(0, lineIndex * lineHeight - editor.clientHeight * 0.35);
    editor.setSelectionRange(index, index + term.length);
  }

  function moveMatch(direction: 1 | -1) {
    if (matches.length === 0) {
      return;
    }

    setActiveMatchIndex((current) => {
      if (current < 0) {
        return 0;
      }
      return (current + direction + matches.length) % matches.length;
    });
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      moveMatch(event.shiftKey ? -1 : 1);
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeSearch();
    }
  }

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
          ref={editorRef}
          className={isSearchOpen ? "code-editor with-search" : "code-editor"}
          spellCheck={false}
          value={jsxCode}
          onChange={(event) => onJsxChange(event.target.value)}
        />
        {isSearchOpen ? (
          <div className="code-search-bar">
            <Search size={16} />
            <input
              ref={searchInputRef}
              value={searchTerm}
              placeholder="코드 검색"
              onChange={(event) => setSearchTerm(event.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            <span className={matches.length ? "search-count" : "search-count empty"}>
              {searchTerm.trim() ? `${activeMatchIndex + 1 > 0 ? activeMatchIndex + 1 : 0}/${matches.length}` : "0/0"}
            </span>
            <button className="icon-button" type="button" title="이전 결과" aria-label="이전 결과" onClick={() => moveMatch(-1)}>
              <ChevronUp size={16} />
            </button>
            <button className="icon-button" type="button" title="다음 결과" aria-label="다음 결과" onClick={() => moveMatch(1)}>
              <ChevronDown size={16} />
            </button>
            <button className="icon-button" type="button" title="검색 닫기" aria-label="검색 닫기" onClick={closeSearch}>
              <X size={16} />
            </button>
          </div>
        ) : null}
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
