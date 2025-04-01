import { ChangeEvent, useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css'

interface Post{
  readonly id?:number;
  title:string;
  author:string;
}
declare global{
  interface Window{
    api:{
      getPosts: ()=>Promise<Post[]> //글 목록을 받아오는 기능 (promise로 받아오겠다.)
      addPost : (a:Post) => Promise<Post> //글 추가하는 기능
      deletePost : (a:number|undefined)=>Promise<Post> //글 삭제하는 기능
    }
  }
}
function App() {
  //글 목록
  const [posts, setPosts] = useState<Post[]>([]);
  //입력한 내용을 상태값으로 관리
  const [newPost, setNewPost] = useState<Post>({
    title:"",
    author:""
  });

  const handleChange = (e:ChangeEvent<HTMLInputElement>)=>{
    setNewPost({
      ...newPost,
      [e.target.name]:e.target.value
    });
  }
  

  //글 목록을 받아오는 함수
  const load = async ()=>{
    //get Posts()는 promise를 리턴해주기떄문에 await할수가 있고
    //Promise의 제너릭이 Post[]이기때문에 리턴 type이 Post[]이다.
    const posts:Post[] = await window.api.getPosts();
    console.log(posts);
    setPosts(posts);
  };
  useEffect(()=>{
    //글 목록을 받아와서 state에 반영한다.
    load();
  }, []);

  const add = async ()=>{
    const post:Post = await window.api.addPost(newPost);
    console.log(post);
    //입력창 초기화
    setNewPost({
      title:"",
      author:""
    });
    //리프레쉬 
    load();
  }

  const deletePost = async (id:number|undefined)=>{
    await window.api.deletePost(id);
    load();
  }

  return (
    <div className="container">
      <h1>게시글 (Spring Boot + Electron)</h1>
      <input type="text" placeholder="제목" name="title" onChange={handleChange} value={newPost.title}/>
      <input type="text" placeholder="작성자" name="author" onChange={handleChange} value={newPost.author}/>
      <button onClick={add}>추가</button>
      <table className="table table-striped">
        <thead className="table-dark">
          <tr>
            <th>아이디</th>
            <th>제목</th>
            <th>작성자</th>
            <th>삭제</th>
            <th>사제2</th>
          </tr>
        </thead>
        <tbody>
          {posts.map(item=>(
            <tr>
              <td>{item.id}</td>
              <td>{item.title}</td>
              <td>{item.author}</td>
              <td><button onClick={()=>{
                deletePost(item.id);
              }}>삭제</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default App
