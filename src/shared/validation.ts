import { MAX_RESOLUTION, MIN_RESOLUTION } from "./constants";
import type { LoadoutFile } from "./types";

const INVALID_FILE_CHARS = /[\/\\:*?"<>|]/g;

export function sanitizeFileName(input: string): string {
  return input
    .replace(INVALID_FILE_CHARS, "_")
    .replace(/\s+/g, " ")
    .replace(/\.+/g, ".")
    .trim()
    .replace(/^\.+/, "")
    .slice(0, 120);
}

export function validateFileName(input: string): string | null {
  const sanitized = sanitizeFileName(input);
  if (!sanitized) {
    return "파일명을 입력해 주세요.";
  }

  if (sanitized === "." || sanitized === "..") {
    return "사용할 수 없는 파일명입니다.";
  }

  return null;
}

export function validateResolution(width: number, height: number): string | null {
  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    return "해상도는 정수만 입력할 수 있습니다.";
  }

  if (
    width < MIN_RESOLUTION ||
    height < MIN_RESOLUTION ||
    width > MAX_RESOLUTION ||
    height > MAX_RESOLUTION
  ) {
    return `해상도는 ${MIN_RESOLUTION}에서 ${MAX_RESOLUTION} 사이여야 합니다.`;
  }

  return null;
}

export function validateLoadoutSchema(value: unknown): value is LoadoutFile {
  const candidate = value as LoadoutFile;
  return Boolean(
    candidate &&
      candidate.schemaVersion === 1 &&
      typeof candidate.name === "string" &&
      typeof candidate.jsxCode === "string" &&
      candidate.resolution &&
      Number.isInteger(candidate.resolution.width) &&
      Number.isInteger(candidate.resolution.height)
  );
}
