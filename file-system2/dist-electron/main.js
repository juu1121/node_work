import { app, BrowserWindow, ipcMain, dialog, Menu } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import * as afs from "node:fs/promises";
createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(() => {
  createWindow();
  if (!app.isPackaged) {
    win == null ? void 0 : win.webContents.openDevTools();
  }
  ipcMain.on("saveMemo", async (_event, content) => {
    console.log("saveMemo!");
    console.log(__dirname);
    const filePath = path.join(__dirname, "../file/myMemo.txt");
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, "utf-8");
    const result = await dialog.showMessageBox(win, {
      type: "info",
      buttons: ["확인", "취소"],
      //배열, 여러개전달가능 
      defaultId: 0,
      title: "알림",
      message: "저장했습니다.",
      detail: "file폴더에 문자열이 저장되었습니다."
    });
    console.log(result.response);
  });
  ipcMain.on("loadMemo", (event) => {
    const filePath = path.join(__dirname, "../file/myMemo.txt");
    const result = fs.readFileSync(filePath, "utf-8");
    event.sender.send("loaded", result);
  });
  ipcMain.handle("loadMemo2", () => {
    const filePath = path.join(__dirname, "../file/myMemo.txt");
    const result = fs.readFileSync(filePath, "utf-8");
    return result;
  });
  ipcMain.handle("loadMemo3", async () => {
    const filePath = path.join(__dirname, "../file/myMemo.txt");
    const result = await afs.readFile(filePath, "utf-8");
    return result;
  });
  ipcMain.on("saveContent", (_event, data) => {
    fs.mkdirSync(path.dirname(data.filePath), { recursive: true });
    fs.writeFileSync(data.filePath, data.content, "utf-8");
  });
});
const menuTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: "Open",
        click: () => {
          const filePath = path.join(__dirname, "../file/myMemo.txt");
          const result = fs.readFileSync(filePath, "utf-8");
          win.webContents.send("loaded", result);
        }
      },
      {
        label: "Open2",
        click: async () => {
          const { filePaths, canceled } = await dialog.showOpenDialog({
            title: "파일선택츄츄",
            properties: ["openFile"],
            filters: [{ name: "Text Files", extensions: ["txt"] }]
          });
          if (canceled || filePaths.length === 0) return;
          const result = fs.readFileSync(filePaths[0], "utf-8");
          win.webContents.send("loaded", result);
        }
      },
      {
        label: "Save",
        click: () => {
          const filePath = path.join(__dirname, "../file/untitled.txt");
          win.webContents.send("saveContent", { filePath });
          console.log("savepath:", filePath);
        }
      },
      {
        label: "Save As",
        click: async () => {
          const { filePath } = await dialog.showSaveDialog({});
          if (!filePath) return;
          win.webContents.send("saveContent", { filePath });
          console.log("saveaspath:", filePath);
        }
      }
    ]
  },
  {
    label: "Help"
  }
];
const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
