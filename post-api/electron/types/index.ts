
export interface Post{
    readonly id?:number; //옵셔널, 리드온리(읽기전용)
    title:string;
    author:string;
}