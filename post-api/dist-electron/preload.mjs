"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("api", {
  //main process에 get-posts 요청을 한다.
  getPosts: () => electron.ipcRenderer.invoke("get-posts"),
  //main process에 add-post요청을 하면서 매개변수에 전달된 추가할 글 정보를 전달한다!//전달받은걸 전달~
  addPost: (newPost) => electron.ipcRenderer.invoke("add-post", newPost),
  deletePost: (id) => electron.ipcRenderer.invoke("delete-post", id)
});
