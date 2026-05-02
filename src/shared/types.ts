export type WorkspaceState = {
  jsxCode: string;
  width: number;
  height: number;
  currentLoadoutName: string | null;
};

export type Resolution = {
  width: number;
  height: number;
};

export type LoadoutFile = {
  schemaVersion: 1;
  name: string;
  jsxCode: string;
  resolution: Resolution;
  createdAt: string;
  updatedAt: string;
};

export type LoadoutSummary = {
  name: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ExportedImage = {
  name: string;
  pathOrUrl: string;
  createdAt?: string;
  sizeBytes?: number;
};

export type ExportPayload = {
  name: string;
  jsxCode: string;
  width: number;
  height: number;
  mode?: ExportMode;
};

export type ExportMode = "canvas" | "crop";

export type ApiResult<T> = {
  ok: true;
  data: T;
} | {
  ok: false;
  error: string;
};
