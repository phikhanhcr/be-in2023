import { PostStatus, PostType } from '@common/post/Post';
import { LikeType } from '@common/post/UserLke';

export interface ICreatePostRequest {
    images_url: string[];
    description: string;
    type: PostType;
    allow_comment: boolean;
    status: PostStatus;
}

export interface IGetPostDetail {
    post_id: string;
}

export interface IGetPOstByTypeRequest {
    user_id: number;
    type: PostType;
}

export interface ILikePostRequest {
    post_id: string;
    type: LikeType;
}

export interface IUnlikePostRequest {
    post_id: string;
    type: LikeType;
}

export interface ICommentPostRequest {
    post_id: string;
    content: string;
    reply_to?: string;
}

// export interface IPostNewFeedRequest {
//     // @TODO
// }
