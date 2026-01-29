const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  forceExit: () => ipcRenderer.send("FORCE_EXIT_APP"),
});
