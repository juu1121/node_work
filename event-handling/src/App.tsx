import { useEffect, useRef, useState } from "react"

declare global{
  interface Window{
    api: {
      onGreet:(callback:(msg:string)=>void)=>{};
      sendGreet:(msg:string)=>void
    }
  }
}
function App() {
  const [message, setMessage] = useState("");
  useEffect(()=>{
    //위에서 선언한 api객체 사용하기 //api에서 onGreet라는 이벤트가 발생하면 실행할 함수등록한 것
    window.api.onGreet((msg)=>{
      setMessage(msg);
    });
  }, [])

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <h1>Event 처리하기</h1>
      <p> main 프로세스가 전달한 문자열 : <strong>{message}</strong></p>
      <input type="text" ref={inputRef} placeholder="election으로 보낼 메세지 입력..."/>
      <button onClick={()=>{
        //입력한 메세지
        const msg = inputRef.current?.value;
        window.api.sendGreet(msg);
      }}>전송</button>
    </div>
  )
}

export default App
