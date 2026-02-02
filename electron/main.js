const { app, BrowserWindow, globalShortcut, powerSaveBlocker, ipcMain } = require("electron");
const path = require("path");

let mainWindow;
let psbId;

/* ================= CREATE WINDOW ================= */
function createWindow() {
  mainWindow = new BrowserWindow({
    fullscreen: true,
    kiosk: true,                 // 🔒 Exam lock
    autoHideMenuBar: true,
    closable: false,
    minimizable: false,
    maximizable: false,
    alwaysOnTop: true,
    focusable: true,

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      devTools: false
    },
  });

  // ✅ Load built React frontend
  mainWindow.loadFile(
    path.join(__dirname, "../frontend/dist/index.html")
  );

  // 🔴 Detect app switch / focus loss
  mainWindow.on("blur", () => {
    mainWindow.focus();
    mainWindow.webContents.send("APP_BLUR");
  });

  // 🔴 Prevent closing
  mainWindow.on("close", (e) => {
    e.preventDefault();
    mainWindow.webContents.send("APP_CLOSE_ATTEMPT");
  });
}

/* ================= IPC ================= */
ipcMain.on("FORCE_EXIT_APP", () => {
  app.exit(0);
});

/* ================= APP READY ================= */
app.whenReady().then(() => {

  // 🟢 Prevent sleep
  psbId = powerSaveBlocker.start("prevent-display-sleep");

  createWindow();

  // 🔒 Block common shortcuts
  globalShortcut.register("Escape", () => {});
  globalShortcut.register("CommandOrControl+W", () => {});
  globalShortcut.register("CommandOrControl+Q", () => {});
  globalShortcut.register("CommandOrControl+R", () => {});
  globalShortcut.register("F5", () => {});
  globalShortcut.register("F11", () => {});
});

/* ================= CLEANUP ================= */
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
  if (psbId) powerSaveBlocker.stop(psbId);
});
