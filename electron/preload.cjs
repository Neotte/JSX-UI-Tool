const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("localApi", {
  saveLoadout: (payload) => ipcRenderer.invoke("loadout:save", payload),
  listLoadouts: () => ipcRenderer.invoke("loadout:list"),
  readLoadout: (name) => ipcRenderer.invoke("loadout:read", name),
  exportPng: (payload) => ipcRenderer.invoke("export:png", payload),
  listExports: () => ipcRenderer.invoke("export:list"),
  openExportPreview: (name) => ipcRenderer.invoke("export:preview", name)
});

contextBridge.exposeInMainWorld("exportBridge", {
  ready: (payload) => ipcRenderer.send("export:ready", payload)
});
