const fs = require("node:fs/promises");
const path = require("node:path");
const { app, BrowserWindow, ipcMain, shell } = require("electron");

const SCHEMA_VERSION = 1;
const MIN_RESOLUTION = 1;
const MAX_RESOLUTION = 8192;
const INVALID_FILE_CHARS = /[\/\\:*?"<>|]/g;

let mainWindow = null;

function getProjectRoot() {
  return app.isPackaged ? path.dirname(process.execPath) : process.cwd();
}

function getDataDirs() {
  const root = getProjectRoot();
  return {
    root,
    saves: path.join(root, "saves"),
    exports: path.join(root, "exports")
  };
}

async function ensureDataDirs() {
  const dirs = getDataDirs();
  await fs.mkdir(dirs.saves, { recursive: true });
  await fs.mkdir(dirs.exports, { recursive: true });
}

function sanitizeFileName(input) {
  return String(input || "")
    .replace(/\.(png|json)$/i, "")
    .replace(INVALID_FILE_CHARS, "_")
    .replace(/\s+/g, " ")
    .replace(/\.+/g, ".")
    .trim()
    .replace(/^\.+/, "")
    .slice(0, 120);
}

function validateFileName(input) {
  const sanitized = sanitizeFileName(input);
  if (!sanitized || sanitized === "." || sanitized === "..") {
    throw new Error("파일명을 입력해 주세요.");
  }
  return sanitized;
}

function validateResolution(width, height) {
  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    throw new Error("해상도는 정수만 입력할 수 있습니다.");
  }
  if (
    width < MIN_RESOLUTION ||
    height < MIN_RESOLUTION ||
    width > MAX_RESOLUTION ||
    height > MAX_RESOLUTION
  ) {
    throw new Error(`해상도는 ${MIN_RESOLUTION}에서 ${MAX_RESOLUTION} 사이여야 합니다.`);
  }
}

function safePath(baseDir, fileName) {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(baseDir, fileName);
  if (resolvedTarget !== resolvedBase && resolvedTarget.startsWith(resolvedBase + path.sep)) {
    return resolvedTarget;
  }
  throw new Error("허용되지 않은 파일 경로입니다.");
}

function asResult(fn) {
  return async (...args) => {
    try {
      return { ok: true, data: await fn(...args) };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다."
      };
    }
  };
}

function validateLoadout(value) {
  return Boolean(
    value &&
      value.schemaVersion === SCHEMA_VERSION &&
      typeof value.name === "string" &&
      typeof value.jsxCode === "string" &&
      value.resolution &&
      Number.isInteger(value.resolution.width) &&
      Number.isInteger(value.resolution.height)
  );
}

async function saveLoadout(_event, payload) {
  const dirs = getDataDirs();
  const name = validateFileName(payload.name);
  validateResolution(Number(payload.width), Number(payload.height));

  if (typeof payload.jsxCode !== "string" || !payload.jsxCode.trim()) {
    throw new Error("JSX 코드를 입력해 주세요.");
  }

  const now = new Date().toISOString();
  const filePath = safePath(dirs.saves, `${name}.json`);
  let createdAt = now;

  try {
    const existing = JSON.parse(await fs.readFile(filePath, "utf8"));
    if (typeof existing.createdAt === "string") {
      createdAt = existing.createdAt;
    }
  } catch {
    createdAt = now;
  }

  const loadout = {
    schemaVersion: SCHEMA_VERSION,
    name,
    jsxCode: payload.jsxCode,
    resolution: {
      width: Number(payload.width),
      height: Number(payload.height)
    },
    createdAt,
    updatedAt: now
  };

  await fs.writeFile(filePath, JSON.stringify(loadout, null, 2), "utf8");
  return loadout;
}

async function listLoadouts() {
  const { saves } = getDataDirs();
  const entries = await fs.readdir(saves, { withFileTypes: true });
  const items = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.toLowerCase().endsWith(".json")) {
      continue;
    }

    const filePath = safePath(saves, entry.name);
    try {
      const data = JSON.parse(await fs.readFile(filePath, "utf8"));
      if (validateLoadout(data)) {
        items.push({
          name: data.name,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        });
      }
    } catch {
      items.push({ name: entry.name.replace(/\.json$/i, "") });
    }
  }

  return items.sort((a, b) => a.name.localeCompare(b.name));
}

async function readLoadout(_event, nameInput) {
  const { saves } = getDataDirs();
  const name = validateFileName(nameInput);
  const filePath = safePath(saves, `${name}.json`);
  const data = JSON.parse(await fs.readFile(filePath, "utf8"));

  if (!validateLoadout(data)) {
    throw new Error("로드아웃 파일 형식이 올바르지 않습니다.");
  }

  validateResolution(data.resolution.width, data.resolution.height);
  return data;
}

async function listExports() {
  const { exports } = getDataDirs();
  const entries = await fs.readdir(exports, { withFileTypes: true });
  const items = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.toLowerCase().endsWith(".png")) {
      continue;
    }

    const filePath = safePath(exports, entry.name);
    const [stat, buffer] = await Promise.all([fs.stat(filePath), fs.readFile(filePath)]);
    items.push({
      name: entry.name,
      pathOrUrl: `data:image/png;base64,${buffer.toString("base64")}`,
      createdAt: stat.birthtime.toISOString(),
      sizeBytes: stat.size
    });
  }

  return items.sort((a, b) => a.name.localeCompare(b.name));
}

async function openExportPreview(_event, nameInput) {
  const { exports } = getDataDirs();
  const name = validateFileName(nameInput);
  const filePath = safePath(exports, `${name}.png`);
  await shell.showItemInFolder(filePath);
  const buffer = await fs.readFile(filePath);
  return {
    name: `${name}.png`,
    pathOrUrl: `data:image/png;base64,${buffer.toString("base64")}`
  };
}

function getEntryUrl(fileName) {
  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    return `${devServerUrl}/${fileName}`;
  }
  return path.join(__dirname, "..", "dist", fileName);
}

async function loadRendererWindow(win, fileName) {
  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    await win.loadURL(getEntryUrl(fileName));
  } else {
    await win.loadFile(getEntryUrl(fileName));
  }
}

async function exportPng(_event, payload) {
  const { exports } = getDataDirs();
  const name = validateFileName(payload.name);
  const width = Number(payload.width);
  const height = Number(payload.height);
  validateResolution(width, height);
  const exportMode = payload.mode === "crop" ? "crop" : "canvas";

  if (typeof payload.jsxCode !== "string" || !payload.jsxCode.trim()) {
    throw new Error("JSX 코드를 입력해 주세요.");
  }

  const filePath = safePath(exports, `${name}.png`);
  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const preload = path.join(__dirname, "preload.cjs");
  const win = new BrowserWindow({
    width,
    height,
    show: false,
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    webPreferences: {
      preload,
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false
    }
  });

  try {
    await loadRendererWindow(win, "export.html");

    const renderResult = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        ipcMain.removeListener("export:ready", onReady);
        reject(new Error("PNG 렌더링 시간이 초과되었습니다."));
      }, 15000);

      function onReady(_readyEvent, message) {
        if (!message || message.id !== id) {
          return;
        }

        clearTimeout(timeout);
        ipcMain.removeListener("export:ready", onReady);

        if (message.ok) {
          resolve(message);
        } else {
          reject(new Error(message.error || "JSX 렌더링 중 오류가 발생했습니다."));
        }
      }

      ipcMain.on("export:ready", onReady);
      win.webContents.executeJavaScript(
        `window.__renderExport(${JSON.stringify({
          id,
          jsxCode: payload.jsxCode,
          width,
          height,
          mode: exportMode
        })})`
      ).catch((error) => {
        clearTimeout(timeout);
        ipcMain.removeListener("export:ready", onReady);
        reject(error);
      });
    });

    if (!renderResult) {
      throw new Error("PNG 렌더링에 실패했습니다.");
    }

    const clip = exportMode === "crop" && renderResult.bounds
      ? {
          x: Math.max(0, Math.min(width - 1, Number(renderResult.bounds.x) || 0)),
          y: Math.max(0, Math.min(height - 1, Number(renderResult.bounds.y) || 0)),
          width: Math.max(1, Math.min(width, Number(renderResult.bounds.width) || width)),
          height: Math.max(1, Math.min(height, Number(renderResult.bounds.height) || height))
        }
      : undefined;
    const capturedImage = clip
      ? await win.webContents.capturePage(clip)
      : await win.webContents.capturePage();
    const capturedSize = capturedImage.getSize();
    const expectedWidth = clip ? clip.width : width;
    const expectedHeight = clip ? clip.height : height;
    const image = capturedSize.width === expectedWidth && capturedSize.height === expectedHeight
      ? capturedImage
      : capturedImage.resize({ width: expectedWidth, height: expectedHeight, quality: "best" });
    await fs.writeFile(filePath, image.toPNG());
    const stat = await fs.stat(filePath);

    return {
      name: `${name}.png`,
      pathOrUrl: "",
      createdAt: stat.birthtime.toISOString(),
      sizeBytes: stat.size
    };
  } finally {
    if (!win.isDestroyed()) {
      win.destroy();
    }
  }
}

async function createMainWindow() {
  await ensureDataDirs();

  mainWindow = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 1024,
    minHeight: 720,
    backgroundColor: "#dbdae2",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  await loadRendererWindow(mainWindow, "index.html");

  if (process.env.QA_SMOKE === "1") {
    await runQaSmoke(mainWindow);
  }
}

async function runQaSmoke(window) {
  const result = await window.webContents.executeJavaScript(`
    (async () => {
      const jsxCode = String.raw\`function Component() {
  return (
    <div style={{
      width: 320,
      height: 160,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 24,
      background: "rgba(171, 68, 109, 0.92)",
      color: "white",
      fontSize: 34,
      fontWeight: 800
    }}>
      QA EXPORT
    </div>
  );
}

export default Component;\`;
      const save = await window.localApi.saveLoadout({
        name: "qa-loadout",
        jsxCode,
        width: 640,
        height: 360
      });
      if (!save.ok) return { step: "saveLoadout", result: save };

      const listBeforeRead = await window.localApi.listLoadouts();
      if (!listBeforeRead.ok) return { step: "listLoadouts", result: listBeforeRead };
      if (!listBeforeRead.data.some((item) => item.name === "qa-loadout")) {
        return { step: "listLoadouts", result: { ok: false, error: "qa-loadout missing" } };
      }

      const read = await window.localApi.readLoadout("qa-loadout");
      if (!read.ok) return { step: "readLoadout", result: read };
      if (read.data.resolution.width !== 640 || read.data.resolution.height !== 360) {
        return { step: "readLoadout", result: { ok: false, error: "resolution mismatch" } };
      }

      const exported = await window.localApi.exportPng({
        name: "qa-export",
        jsxCode,
        width: 640,
        height: 360,
        mode: "canvas"
      });
      if (!exported.ok) return { step: "exportPng", result: exported };

      const cropped = await window.localApi.exportPng({
        name: "qa-export-crop",
        jsxCode,
        width: 640,
        height: 360,
        mode: "crop"
      });
      if (!cropped.ok) return { step: "exportPngCrop", result: cropped };

      const exportsList = await window.localApi.listExports();
      if (!exportsList.ok) return { step: "listExports", result: exportsList };
      const exportedFile = exportsList.data.find((item) => item.name === "qa-export.png");
      const croppedFile = exportsList.data.find((item) => item.name === "qa-export-crop.png");
      if (!exportedFile) {
        return { step: "listExports", result: { ok: false, error: "qa-export.png missing" } };
      }
      if (!croppedFile) {
        return { step: "listExports", result: { ok: false, error: "qa-export-crop.png missing" } };
      }
      if (!exportedFile.pathOrUrl.startsWith("data:image/png;base64,")) {
        return { step: "listExports", result: { ok: false, error: "png data url missing" } };
      }

      return {
        step: "complete",
        result: {
          ok: true,
          loadoutName: read.data.name,
          exportName: exportedFile.name,
          cropExportName: croppedFile.name,
          exportSizeBytes: exportedFile.sizeBytes
        }
      };
    })();
  `);

  console.log(`[qa:smoke] ${JSON.stringify(result)}`);
  if (!result || !result.result || !result.result.ok) {
    app.exit(1);
    return;
  }

  app.exit(0);
}

ipcMain.handle("loadout:save", asResult(saveLoadout));
ipcMain.handle("loadout:list", asResult(listLoadouts));
ipcMain.handle("loadout:read", asResult(readLoadout));
ipcMain.handle("export:png", asResult(exportPng));
ipcMain.handle("export:list", asResult(listExports));
ipcMain.handle("export:preview", asResult(openExportPreview));

app.whenReady().then(createMainWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
