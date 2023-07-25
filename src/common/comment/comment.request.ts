export interface ICreateCommentRequest {
    content: string;
    parent_id?: string;
    post_id: string;
}

export interface IGetCommentsRequest {
    parent_id?: string;
    post_id: string;
}
