const { app, BrowserWindow, globalShortcut, powerSaveBlocker, ipcMain, session } = require("electron");
const path = require("path");

let mainWindow;
let psbId;
let examActive = false;

/* ─────────────────────────────────────────────────────────────
   IMPORTANT: Replace this with your actual backend URL
   e.g. "https://your-api.onrender.com" or "http://192.168.1.5:5000"
   ───────────────────────────────────────────────────────────── */
const BACKEND_URL = "https://localhost:5000";

/* ================= CREATE WINDOW ================= */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    fullscreen: false,   // start normal — kiosk only activates on EXAM_STARTED
    kiosk: false,
    autoHideMenuBar: true,
    closable: true,      // closable until exam starts
    minimizable: true,
    maximizable: true,
    alwaysOnTop: false,
    focusable: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      devTools: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "../frontend/dist/index.html"));

  // Only fire violation when exam is active and window loses focus
  mainWindow.on("blur", () => {
    if (!examActive) return;
    mainWindow.focus();
    mainWindow.webContents.send("ELECTRON_VIOLATION", "window_blur");
  });

  // Block close during exam, allow otherwise
  mainWindow.on("close", (e) => {
    if (!examActive) return;
    e.preventDefault();
    mainWindow.webContents.send("ELECTRON_VIOLATION", "close_attempt");
  });
}

/* ================= FIX CORS / COOKIES FOR file:// ORIGIN =================
   When Electron loads from file://, the browser treats origin as "null".
   This causes backends to reject requests if they check Origin strictly.
   We intercept outgoing requests to the backend and fix the headers.
   ========================================================================= */
function fixCorsForElectron() {
  session.defaultSession.webRequest.onBeforeSendHeaders(
    { urls: [`${BACKEND_URL}/*`] },
    (details, callback) => {
      details.requestHeaders["Origin"]  = BACKEND_URL;
      details.requestHeaders["Referer"] = BACKEND_URL + "/";
      callback({ requestHeaders: details.requestHeaders });
    }
  );

  session.defaultSession.webRequest.onHeadersReceived(
    { urls: [`${BACKEND_URL}/*`] },
    (details, callback) => {
      const headers = { ...details.responseHeaders };
      headers["Access-Control-Allow-Origin"]      = [BACKEND_URL];
      headers["Access-Control-Allow-Credentials"] = ["true"];
      callback({ responseHeaders: headers });
    }
  );
}

/* ================= IPC HANDLERS ================= */

// React: exam started → engage full lock
ipcMain.on("EXAM_STARTED", () => {
  examActive = true;
  console.log("[Electron] Exam started — lock engaged");

  if (mainWindow) {
    mainWindow.setFullScreen(true);
    mainWindow.setKiosk(true);
    mainWindow.setClosable(false);
    mainWindow.setMinimizable(false);
    mainWindow.setAlwaysOnTop(true);
    mainWindow.focus();
  }

  registerExamShortcuts();
});

// React: exam submitted → release all locks
ipcMain.on("EXAM_FINISHED", () => {
  examActive = false;
  console.log("[Electron] Exam finished — lock released");

  if (mainWindow) {
    mainWindow.setKiosk(false);
    mainWindow.setFullScreen(false);
    mainWindow.setClosable(true);
    mainWindow.setMinimizable(true);
    mainWindow.setAlwaysOnTop(false);
  }

  globalShortcut.unregisterAll();
});

// React: force exit (only works after exam finished)
ipcMain.on("FORCE_EXIT_APP", () => {
  if (!examActive) {
    app.exit(0);
  } else {
    if (mainWindow) mainWindow.focus();
  }
});

/* ================= EXAM SHORTCUTS LOCK ================= */
function registerExamShortcuts() {
  const block = () => {};

  globalShortcut.register("Escape",                  block);
  globalShortcut.register("CommandOrControl+W",      block);
  globalShortcut.register("CommandOrControl+Q",      block);
  globalShortcut.register("CommandOrControl+R",      block);
  globalShortcut.register("CommandOrControl+Shift+I",block);
  globalShortcut.register("CommandOrControl+Shift+J",block);
  globalShortcut.register("CommandOrControl+Shift+C",block);
  globalShortcut.register("CommandOrControl+U",      block);
  globalShortcut.register("F5",                      block);
  globalShortcut.register("F11",                     block);
  globalShortcut.register("F12",                     block);
  globalShortcut.register("Alt+F4",                  block);
  globalShortcut.register("Alt+Tab",                 () => { if (mainWindow) mainWindow.focus(); });
  globalShortcut.register("Super+D",                 block);
  globalShortcut.register("Super+L",                 block);
  globalShortcut.register("Meta+D",                  block);
  globalShortcut.register("Meta+L",                  block);
}

/* ================= APP READY ================= */
app.whenReady().then(() => {
  psbId = powerSaveBlocker.start("prevent-display-sleep");
  fixCorsForElectron();
  createWindow();
});

/* ================= CLEANUP ================= */
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
  if (psbId !== undefined) powerSaveBlocker.stop(psbId);
});