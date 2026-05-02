import { useEffect, useState } from "react";
import { DEFAULT_HEIGHT, DEFAULT_JSX, DEFAULT_WIDTH } from "../shared/constants";
import type { ExportMode, ExportedImage, LoadoutSummary, WorkspaceState } from "../shared/types";
import { validateFileName, validateResolution } from "../shared/validation";
import { TabNav, type TabId } from "./components/TabNav";
import { getLocalApi } from "./lib/localApi";
import { GallerySection } from "./sections/GallerySection";
import { LoadoutSection } from "./sections/LoadoutSection";
import { WorkspaceSection } from "./sections/WorkspaceSection";

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>("workspace");
  const [workspace, setWorkspace] = useState<WorkspaceState>({
    jsxCode: DEFAULT_JSX,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    currentLoadoutName: null
  });
  const [exportName, setExportName] = useState("sample-export");
  const [exportMode, setExportMode] = useState<ExportMode>("canvas");
  const [loadoutName, setLoadoutName] = useState("sample-loadout");
  const [isExportOpen, setExportOpen] = useState(false);
  const [loadouts, setLoadouts] = useState<LoadoutSummary[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<ExportedImage[]>([]);
  const [selectedFile, setSelectedFile] = useState<ExportedImage | null>(null);
  const [isBusy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const api = getLocalApi();

  useEffect(() => {
    refreshLoadouts();
    refreshGallery();
  }, []);

  async function refreshLoadouts() {
    const result = await api.listLoadouts();
    if (result.ok) {
      setLoadouts(result.data);
    } else {
      setMessage(result.error);
    }
  }

  async function refreshGallery() {
    const result = await api.listExports();
    if (result.ok) {
      setGalleryFiles(result.data);
    } else {
      setMessage(result.error);
    }
  }

  async function saveLoadout() {
    const nameError = validateFileName(loadoutName);
    const resolutionError = validateResolution(workspace.width, workspace.height);
    if (nameError || resolutionError) {
      setMessage(nameError || resolutionError);
      return;
    }

    setBusy(true);
    const result = await api.saveLoadout({
      name: loadoutName,
      jsxCode: workspace.jsxCode,
      width: workspace.width,
      height: workspace.height
    });
    setBusy(false);

    if (result.ok) {
      setWorkspace((current) => ({ ...current, currentLoadoutName: result.data.name }));
      setMessage("로드아웃을 저장했습니다.");
      await refreshLoadouts();
    } else {
      setMessage(result.error);
    }
  }

  async function loadLoadout(name: string) {
    setBusy(true);
    const result = await api.readLoadout(name);
    setBusy(false);

    if (result.ok) {
      setWorkspace({
        jsxCode: result.data.jsxCode,
        width: result.data.resolution.width,
        height: result.data.resolution.height,
        currentLoadoutName: result.data.name
      });
      setLoadoutName(result.data.name);
      setActiveTab("workspace");
      setMessage("로드아웃을 불러왔습니다.");
    } else {
      setMessage(result.error);
    }
  }

  async function confirmExport() {
    const nameError = validateFileName(exportName);
    const resolutionError = validateResolution(workspace.width, workspace.height);
    if (nameError || resolutionError) {
      setMessage(nameError || resolutionError);
      return;
    }

    setBusy(true);
    const result = await api.exportPng({
      name: exportName,
      jsxCode: workspace.jsxCode,
      width: workspace.width,
      height: workspace.height,
      mode: exportMode
    });
    setBusy(false);

    if (result.ok) {
      setExportOpen(false);
      setMessage("PNG 파일을 exports 폴더에 저장했습니다.");
      await refreshGallery();
    } else {
      setMessage(result.error);
    }
  }

  return (
    <main className="app-shell">
      <TabNav activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "workspace" ? (
        <WorkspaceSection
          jsxCode={workspace.jsxCode}
          width={workspace.width}
          height={workspace.height}
          currentLoadoutName={workspace.currentLoadoutName}
          exportName={exportName}
          exportMode={exportMode}
          isExportOpen={isExportOpen}
          isBusy={isBusy}
          message={message}
          onJsxChange={(jsxCode) => setWorkspace((current) => ({ ...current, jsxCode }))}
          onWidthChange={(width) => setWorkspace((current) => ({ ...current, width }))}
          onHeightChange={(height) => setWorkspace((current) => ({ ...current, height }))}
          onExportNameChange={setExportName}
          onExportModeChange={setExportMode}
          onOpenExport={() => setExportOpen(true)}
          onCloseExport={() => setExportOpen(false)}
          onConfirmExport={confirmExport}
        />
      ) : null}

      {activeTab === "loadouts" ? (
        <LoadoutSection
          loadoutName={loadoutName}
          loadouts={loadouts}
          isBusy={isBusy}
          message={message}
          onNameChange={setLoadoutName}
          onSave={saveLoadout}
          onRefresh={refreshLoadouts}
          onLoad={loadLoadout}
        />
      ) : null}

      {activeTab === "gallery" ? (
        <GallerySection
          files={galleryFiles}
          selectedFile={selectedFile}
          isBusy={isBusy}
          message={message}
          onRefresh={refreshGallery}
          onSelect={setSelectedFile}
          onClosePreview={() => setSelectedFile(null)}
        />
      ) : null}
    </main>
  );
}
