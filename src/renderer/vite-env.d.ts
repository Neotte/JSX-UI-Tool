/// <reference types="vite/client" />

import type {
  ApiResult,
  ExportPayload,
  ExportedImage,
  LoadoutFile,
  LoadoutSummary
} from "../shared/types";

declare global {
  interface Window {
    localApi?: {
      saveLoadout: (payload: {
        name: string;
        jsxCode: string;
        width: number;
        height: number;
      }) => Promise<ApiResult<LoadoutFile>>;
      listLoadouts: () => Promise<ApiResult<LoadoutSummary[]>>;
      readLoadout: (name: string) => Promise<ApiResult<LoadoutFile>>;
      exportPng: (payload: ExportPayload) => Promise<ApiResult<ExportedImage>>;
      listExports: () => Promise<ApiResult<ExportedImage[]>>;
      openExportPreview: (name: string) => Promise<ApiResult<ExportedImage>>;
    };
    exportBridge: {
      ready: (payload: {
        id: string;
        ok: boolean;
        error?: string;
        bounds?: { x: number; y: number; width: number; height: number };
      }) => void;
    };
    __renderExport: (payload: {
      id: string;
      jsxCode: string;
      width: number;
      height: number;
      mode?: "canvas" | "crop";
    }) => void;
  }
}
