import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld( 'api', {
  //저장할 문자열이 매개변수에 전달된다.
  save: (content:string)=>{
    //render프로세스에서 "saveMemo" 이벤트 발생시키면서 문자열 전달
    ipcRenderer.send("saveMemo", content);
  }
})
