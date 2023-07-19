import { ICreatePostRequest, IGetPOstByTypeRequest } from '@api/post/post.request';
import { IAuthUser } from '@common/auth/auth.interface';
import { APIError } from '@common/error/api.error';
import User from '@common/user/User';
import { ErrorCode } from '@config/errors';
import httpStatus from 'http-status';
import Post, { IPost, PostType } from '@common/post/Post';

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

    static async getPostByType(req: IGetPOstByTypeRequest): Promise<IPost[]> {
        const posts = await Post.find({ user_id: req.user_id, type: req.type });
        return posts;
    }

    // @Todo
    static async getMewFeed(req: IGetPOstByTypeRequest): Promise<void> {
        // dp something
    }
}
