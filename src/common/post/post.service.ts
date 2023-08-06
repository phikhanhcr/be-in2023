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
import Post, { IPost, IPostResponse, PostStatus, PostType } from '@common/post/Post';
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
    static async getMewFeed(auth: IAuthUser): Promise<IPostResponse[]> {
        // dp something
        const posts = await Post.find({});
        const postResponse: IPostResponse[] = [];
        await Promise.all(
            posts.map(async (post) => {
                const postsTransform = post.transform();
                const userLike = await UserLke.findOne({
                    user_id: auth.id,
                    reference_id: post._id,
                    status: LikeStatus.LIKE,
                    type: PostType.POST,
                });
                console.log({ userLike });
                postsTransform.is_liked = false;
                if (userLike) {
                    postsTransform.is_liked = true;
                }

                postResponse.push(postsTransform);
            }),
        );

        return postResponse;
    }

    // @Todo
    static async like(auth: IAuthUser, req: ILikePostRequest): Promise<void> {
        let post = await Post.findOne({
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

        post = await Post.findOneAndUpdate(
            {
                _id: req.post_id,
                status: PostStatus.PUBLIC,
            },
            {
                $inc: { like_count: 1 },
            },
            { new: true },
        );

        // check user like post or not
        eventbus.emit(EVENT_POST_LIKED, post, auth);
    }

    static async unlike(auth: IAuthUser, req: IUnlikePostRequest): Promise<void> {
        // dp something

        let post = await Post.findOne({
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

        post = await Post.findOneAndUpdate(
            {
                _id: req.post_id,
                status: PostStatus.PUBLIC,
            },
            {
                $inc: { like_count: -1 },
            },
            { new: true },
        );

        // check user like post or not
        eventbus.emit(EVENT_POST_UNLIKED, post, auth);
        // EVENT SOURCE SEND NOTIFICATION TO AUTHOR
    }
}
