import { PostStatus, PostType } from '@common/post/Post';

export interface ICreatePostRequest {
    images_url: string[];
    description: string;
    type: PostType;
    allow_comment: boolean;
    status: PostStatus;
}

export interface IGetPOstByTypeRequest {
    user_id: number;
    type: PostType;
}

// export interface IPostNewFeedRequest {
//     // @TODO
// }
