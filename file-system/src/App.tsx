// bootstrap css 로딩

import 'bootstrap/dist/css/bootstrap.css'
import { useEffect, useRef, useState } from 'react';

declare global{
  interface Window{
    api: {
      save:(content:string)=>void,
      load:()=>void,
      onLoad:( callback:(content:string) => void ) => void
    }
  }
}
function App() {

  const [content, setContent] = useState<string>("");
  useEffect(()=>{
    //onLoad함수를 호출하면서, 매개변수에 전달함 함수를 등록하고, 
    // savedContent를 전달하면서 savedContent를 가져와서 상태값으로 관리리
    window.api.onLoad((savedContent:string)=>{
      setContent(savedContent);
    })
  })

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  return (
    <div className='container'>
      <h1>메모장입니다.</h1>
      <textarea ref={textareaRef} className='form-control mb-2' style={{height:"300px"}} ></textarea>
      <button className='btn btn-success me-2' onClick={()=>{
        //입력한 메세지
        const content = textareaRef.current?.value;
        window.api.save(content || "");
        alert("저장했습니다.");
      }}>저장</button>
      <button className='btn btn-primary' onClick={()=>{
        window.api.load();
      }}>불러오기</button>
    </div>
  )
}

export default App
