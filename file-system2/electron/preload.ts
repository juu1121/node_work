import { ipcRenderer, contextBridge } from 'electron'

//여기는 renderer 프로세스 (리액트와 관련된, 화면구성하는 프로세스)
contextBridge.exposeInMainWorld('api', {
  save: (content:string)=>{
    console.log("save!");
    //main 프로세스에 이벤트를 발생시키면서 저장할 문자열을 전달한다.
    ipcRenderer.send("saveMemo", content);
  },
  load: ()=>{
    ipcRenderer.send("loadMemo");
  },
  onLoad: (callback:(a:string)=>void) => {
    //이 이벤트는 여기에 실행의 흐름이 와야 등록이 된다.
    ipcRenderer.on("loaded", (_event, content)=>{
      callback(content); //함수호출하면서 데이터넣어줌줌
    });
  },
  load2: ()=>{
    return ipcRenderer.invoke("loadMemo2");
  },
  load3: ()=> ipcRenderer.invoke("loadMemo3"), //람다식
  onSave:(callback:()=>string)=>{

    ipcRenderer.on("saveContent", (_event, data)=>{
      //현재까지 입력한 문자열 읽어오기기
      const content = callback(); //함수호출해서 리턴된데이터 사용용
      //콘솔에 출력하기
      console.log("현재까지 입력한 문자열:"+content);
      data.content=content;
      //main 프로세스에 이벤트 발생 시키면서 전달하기기
      ipcRenderer.send("saveContent", data);
    })
  }
})
