import 'bootstrap/dist/css/bootstrap.css'
import { useEffect, useRef } from 'react';

declare global{
  //api의  type을 미리 정의하고고
  type ApiType ={
    save:(a:string)=>void,
    load:()=>void,
    onLoad:(callback:(a:string)=>void)=>void    
    load2:()=> Promise<string>, 
    //함수인데, 문자데이터를 담고있는 Promise 객체를 리턴하는 함수 
    //promise는 해결이 되야 데이터가 들어올거잖아.
    load3:()=> Promise<string>,
    onSave:(callback:()=>string)=>void
  }

  interface Window{
    //api는 오브젝트인데 해당키값으로 함수를 가지고있는 타입이라는거
    api:ApiType //정의된 type을 사용하기 
  }
}

function App() {

  useEffect(()=>{
    window.api.onLoad((content)=>{
      //전달 받은 내용을 textarea의 value값으로 넣어주기기
      areaRef.current!.value = content;
    });

    window.api.onSave(()=>{
      //이 함수가 만일 호출되면 현재까지 입력한 문자열을 리턴해준다.
      return areaRef.current!.value;
    });
  }, []);

  const areaRef=useRef<HTMLTextAreaElement>(null);

  return (
    <div className="container">
      <h1>Memo App</h1>
      <textarea className='form-control mb-2' 
        style={{height:"300px"}}
        ref={areaRef}></textarea>
      <button className='btn btn-success me-2'
        onClick={()=>{
          //입력한 내용
          const content = areaRef.current!.value;
          window.api.save(content);
        }}>저장</button>
      <button className="btn btn-primary"
        onClick={()=>{
          window.api.load();
        }}>불러오기</button>
      <button className='btn btn-info'
        onClick={async ()=>{
          //promise객체를 이용해서 저장된 문자열을 읽어온다.
          const content = await window.api.load2();
          areaRef.current!.value=content;
        }}>불러오기2 </button>
      <button className='btn btn-info'
        onClick={async ()=>{
          //promise객체를 이용해서 저장된 문자열을 읽어온다.
          const content = await window.api.load3();
          areaRef.current!.value=content;
        }}>불러오기3 </button>
    </div>
  )
}

export default App
