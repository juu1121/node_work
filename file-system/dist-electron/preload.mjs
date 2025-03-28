"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("api", {
  //저장할 문자열이 매개변수에 전달된다.
  save: (content) => {
    electron.ipcRenderer.send("saveMemo", content);
  }
});
