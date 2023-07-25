import {
    ICreatePostRequest,
    IGetPOstByTypeRequest,
    IGetPostDetail,
    ILikePostRequest,
    IUnlikePostRequest,
} from '@api/post/post.request';
import { IAuthUser } from '@common/auth/auth.interface';
import { APIError } from '@common/error/api.error';
import User from '@common/user/User';
import { ErrorCode } from '@config/errors';
import httpStatus from 'http-status';
import Post, { IPost, PostStatus, PostType } from '@common/post/Post';
import UserLke, { LikeStatus } from './UserLke';
import eventbus from '@common/eventbus';
import { EVENT_POST_LIKED, EVENT_POST_UNLIKED } from './post.event';

// post detail
// comment (create, delete)
// like, unlike post

export class PostService {
    static async create(auth: IAuthUser, req: ICreatePostRequest): Promise<IPost> {
        // do something
        const user = await User.findById(auth.id);
        if (!user) {
            throw new APIError({
                message: `auth.login.${httpStatus.BAD_REQUEST}.${ErrorCode.AUTH_ACCOUNT_NOT_FOUND}`,
                status: httpStatus.BAD_REQUEST,
                errorCode: ErrorCode.AUTH_ACCOUNT_NOT_FOUND,
            });
        }

        const post = await Post.create({
            user_id: user._id,
            images_url: req.images_url,
            description: req.description,
            type: PostType.POST,
            allow_comment: req.allow_comment,
            status: req.status,
        });

        // event bus
        // @TODO
        // push new post to follower
        return post;
    }

    static async getPostsByType(req: IGetPOstByTypeRequest): Promise<IPost[]> {
        const posts = await Post.find({ user_id: req.user_id, type: req.type });
        return posts;
    }

    static async getById(req: IGetPostDetail): Promise<IPost> {
        // populate comment
        // populate like
        const posts = await Post.findById(req.post_id);
        return posts;
    }

    // @Todo
    static async getMewFeed(req: IGetPOstByTypeRequest): Promise<IPost[]> {
        // dp something
        const posts = await Post.find({ user_id: req.user_id, type: req.type });
        return posts;
    }

    // @Todo
    static async like(auth: IAuthUser, req: ILikePostRequest): Promise<void> {
        // dp something
        const post = await Post.findOne({
            _id: req.post_id,
            status: PostStatus.PUBLIC,
        });
        if (!post) {
            throw new APIError({
                message: `post.like.${httpStatus.BAD_REQUEST}.${ErrorCode.POST_NOT_FOUND}`,
                status: httpStatus.BAD_REQUEST,
                errorCode: ErrorCode.POST_NOT_FOUND,
            });
        }

        let userLike = await UserLke.findOne({
            user_id: auth.id,
            reference_id: req.post_id,
            type: req.type,
            status: LikeStatus.LIKE,
        });

        if (userLike) {
            throw new APIError({
                message: `post.like.${httpStatus.BAD_REQUEST}.${ErrorCode.POST_LIKED}`,
                status: httpStatus.BAD_REQUEST,
                errorCode: ErrorCode.POST_LIKED,
            });
        }

        userLike = await UserLke.findOneAndUpdate(
            {
                user_id: auth.id,
                reference_id: req.post_id,
                type: req.type,
            },
            {
                status: LikeStatus.LIKE,
            },
            {
                upsert: true,
                new: true,
            },
        );

        // check user like post or not
        eventbus.emit(EVENT_POST_LIKED, userLike);
    }

    static async unlike(auth: IAuthUser, req: IUnlikePostRequest): Promise<void> {
        // dp something

        const post = await Post.findOne({
            _id: req.post_id,
            status: PostStatus.PUBLIC,
        });
        if (!post) {
            throw new APIError({
                message: `post.like.${httpStatus.BAD_REQUEST}.${ErrorCode.POST_NOT_FOUND}`,
                status: httpStatus.BAD_REQUEST,
                errorCode: ErrorCode.POST_NOT_FOUND,
            });
        }

        let userUnLike = await UserLke.findOne({
            user_id: auth.id,
            reference_id: req.post_id,
            type: req.type,
        });

        if (!userUnLike) {
            throw new APIError({
                message: `post.like.${httpStatus.BAD_REQUEST}.${ErrorCode.POST_LIKED}`,
                status: httpStatus.BAD_REQUEST,
                errorCode: ErrorCode.POST_LIKED,
            });
        }

        if (userUnLike.status === LikeStatus.UNLIKE) {
            throw new APIError({
                message: `post.like.${httpStatus.BAD_REQUEST}.${ErrorCode.POST_UNLIKED}`,
                status: httpStatus.BAD_REQUEST,
                errorCode: ErrorCode.POST_UNLIKED,
            });
        }

        userUnLike = await UserLke.findOneAndUpdate(
            {
                user_id: auth.id,
                reference_id: req.post_id,
                type: req.type,
                status: LikeStatus.LIKE,
            },
            {
                status: LikeStatus.UNLIKE,
            },
        );

        // check user like post or not
        eventbus.emit(EVENT_POST_UNLIKED, userUnLike);
        // EVENT SOURCE SEND NOTIFICATION TO AUTHOR
    }
}
