import fs from "node:fs"
import { desktopCapturer, dialog, ipcMain, screen } from "electron";

//renderer 프로세스에서 발생시키는 "save-image" 이벤트 처리리
ipcMain.on("save-image", async (_event, imageData)=>{
    if(!imageData)return;
    //취소 되었는지 여부와 저장할 파일의 경로를 얻어낸다.
    // 리턴된 객체에서 {canceled, filePath}를 읽어오는것!     
     const {canceled, filePath} = await dialog.showSaveDialog({
      title:"켑쳐된 이미지 저장츄",
      defaultPath:"capture.png",
      filters:[{name:"Images", extensions:["png"]}]
    });    
    if(!canceled){
        //data url에서 앞에 있는 필요없는 문자열 제거 (실제 pna이미지로 저장하기 위해해)
        //제거해주지않으면 이미지저장한게 깨지더랑...
        const data = imageData.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(data, "base64");
        fs.writeFile(filePath, buffer, (error)=>{
            if(error){
                //여기가 실행되면 에러
                console.log(error);
            }else{
                console.log(filePath+" save success!");
                dialog.showMessageBox({
                    type: 'info',
                    title: '저장 완료',
                    message: '이미지가 성공적으로 저장되었습니다.',
                    buttons: ['확인']
                });


            }
        });
    }
});

ipcMain.handle("screen-capture", async ()=>{
    //Display 객체 얻어내기
    const display = screen.getPrimaryDisplay();
    //화면의 크기 정보
    const {bounds} = display;
    //원하는 크기로 capture하기
    const sources = await desktopCapturer.getSources({
        types:["screen"],
        thumbnailSize:{width:bounds.width, height:bounds.height}
    });
    if(sources.length > 0){
        const screen = sources[0];
        const thumbnail = screen.thumbnail;
        //캡쳐된 이미지 객체를 data url 문자열로 얻어내서 리턴한다.
        const dataUrl = thumbnail.toDataURL();
        return dataUrl;
    }
    throw new Error("Error!");
});