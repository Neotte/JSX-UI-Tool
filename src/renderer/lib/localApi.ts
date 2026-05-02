import type { ApiResult, ExportPayload, ExportedImage, LoadoutFile, LoadoutSummary } from "../../shared/types";

type LocalApi = NonNullable<Window["localApi"]>;

const STORAGE_KEY = "local-jsx-asset-designer.loadouts";

export function getLocalApi(): LocalApi {
  if (window.localApi) {
    return window.localApi;
  }

  return browserFallbackApi;
}

function readStoredLoadouts(): LoadoutFile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStoredLoadouts(loadouts: LoadoutFile[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(loadouts));
}

const browserFallbackApi: LocalApi = {
  async saveLoadout(payload): Promise<ApiResult<LoadoutFile>> {
    const now = new Date().toISOString();
    const loadouts = readStoredLoadouts();
    const previous = loadouts.find((item) => item.name === payload.name);
    const next: LoadoutFile = {
      schemaVersion: 1,
      name: payload.name,
      jsxCode: payload.jsxCode,
      resolution: {
        width: payload.width,
        height: payload.height
      },
      createdAt: previous?.createdAt ?? now,
      updatedAt: now
    };
    writeStoredLoadouts([...loadouts.filter((item) => item.name !== payload.name), next]);
    return { ok: true, data: next };
  },
  async listLoadouts(): Promise<ApiResult<LoadoutSummary[]>> {
    return {
      ok: true,
      data: readStoredLoadouts()
        .map(({ name, createdAt, updatedAt }) => ({ name, createdAt, updatedAt }))
        .sort((a, b) => a.name.localeCompare(b.name))
    };
  },
  async readLoadout(name: string): Promise<ApiResult<LoadoutFile>> {
    const loadout = readStoredLoadouts().find((item) => item.name === name);
    return loadout ? { ok: true, data: loadout } : { ok: false, error: "로드아웃을 찾을 수 없습니다." };
  },
  async exportPng(_payload: ExportPayload): Promise<ApiResult<ExportedImage>> {
    return { ok: false, error: "PNG 내보내기는 Electron 앱에서 실행해 주세요." };
  },
  async listExports(): Promise<ApiResult<ExportedImage[]>> {
    return { ok: true, data: [] };
  },
  async openExportPreview(_name: string): Promise<ApiResult<ExportedImage>> {
    return { ok: false, error: "갤러리 파일 열기는 Electron 앱에서 실행해 주세요." };
  }
};
