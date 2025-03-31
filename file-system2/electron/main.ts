import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
//filesystem 에 관련된 작업을 할 모듈 import
import fs from 'node:fs';
import * as afs from 'node:fs/promises';

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})


// app이 준비가 되었을때 실행할 함수 등록
app.whenReady().then(()=>{
  createWindow(); //window 구성하기

  //개발시 console 창 열기
  if(!app.isPackaged){
    win?.webContents.openDevTools();
  }

  //ipcRenderer.send("saveMemo", 데이터)를 호출하면 아래의 함수가 호출된다.
  ipcMain.on("saveMemo", (_event, content: string)=>{
    console.log("saveMemo!");
    console.log(__dirname);
    const filePath = path.join(__dirname, "../file/myMemo.txt");
    //recursive:true는 해당 경로의 폴더가 존재하지 않으면 만들어준다. 
    fs.mkdirSync(path.dirname(filePath), {recursive:true});
    //파일에 문자열 출력하기
    fs.writeFileSync(filePath, content, "utf-8");
  });

  ipcMain.on("loadMemo", (event) =>{
    const filePath = path.join(__dirname, "../file/myMemo.txt");
    const result = fs.readFileSync(filePath, "utf-8");
    //event객체 사용  => event.sender : 이벤트를 발생시킨 해당 렌더러 프로세스 가리킴
    //event.sender 이벤트를 발생시킨 프로세스에 이벤트 발생 시키면서 데이터 전달
    event.sender.send("loaded", result);
  });

  //render 프로세스에서 .invoke()하면 .handle()로 처리하면된다.
  ipcMain.handle("loadMemo2", ()=>{
    const filePath = path.join(__dirname, "../file/myMemo.txt");
    //fs를 이용해서 동기 동작으로 읽어오기
    const result = fs.readFileSync(filePath, "utf-8");
    return result;
  });
  ipcMain.handle("loadMemo3", async ()=>{
    const filePath = path.join(__dirname, "../file/myMemo.txt");
    //비동기 동작으로 읽어오기 //promise를 리턴해서 await하는것것
    const result = await afs.readFile(filePath, "utf-8");
    return result;
  });  
  ipcMain.on("saveContent", (_event, data)=>{
    //data에는 filePath와 content가 들어 있다.
    fs.mkdirSync(path.dirname(data.filePath), {recursive:true});
    //파일에 문자열 출력하기
    fs.writeFileSync(data.filePath, data.content, "utf-8");    

  });
})

const menuTemplate: Electron.MenuItemConstructorOptions = [
  {
    label:"File",
    submenu:[
      {
        label:"Open",
        click:()=>{ //클릭했을때 실행할 함수 등록록
          const filePath = path.join(__dirname, "../file/myMemo.txt");
          const result = fs.readFileSync(filePath, "utf-8");
          //preload.ts에 정의된 "loaded"이벤트 발생시키면서 읽은 데이터 전달하기
          win!.webContents.send("loaded", result); 
        }
      },
      {
        label:"Open2",
        click: async()=>{
          const {filePaths, canceled} = await dialog.showOpenDialog({
            title : "파일선택츄츄",
            properties:['openFile'],
            filters:[{name:'Text Files', extensions:['txt']}]
          });
          //만일 취소 되거나 어떤 파일도 선택한게 없으면 함수를 여기서 끝내라
          if(canceled || filePaths.length ===0 )return;
          const result = fs.readFileSync(filePaths[0], "utf-8");
          win!.webContents.send("loaded", result);
        } 
      },  
      {
        label:"Save",
        click:()=>{
          //file/untitled.txt로 저장하기
          const filePath = path.join(__dirname, "../file/untitled.txt");
          win!.webContents.send("saveContent",{filePath}); //오브젝트에 위의 untitled.txt경로를 담아서 전달
          console.log("savepath:", filePath);
        }
      },
      {
        label:"Save As",
        click:async()=>{
          //원하는 위치에 원하는 파일명으로 저장하기
          const {filePath} = await dialog.showSaveDialog({}); //파일을 저장할 위치와 파일명을 선택
          win!.webContents.send("saveContent",{filePath}); //직접선택한 경로와 파일
          console.log("saveaspath:", filePath);
        }
      }        
    ]
  },
  {
    label:"Help"
  }
];

const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);
