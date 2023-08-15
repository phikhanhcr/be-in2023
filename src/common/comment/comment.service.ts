import { ErrorCode } from '@config/errors';
import { IAuthUser } from '@common/auth/auth.interface';
import Comment, { IComment } from './Comment';
import { ICreateCommentRequest, IGetCommentsRequest } from './comment.request';
import Post from '@common/post/Post';
import httpStatus from 'http-status';
import { APIError } from '@common/error/api.error';
import User from '@common/user/User';
import { EVENT_COMMENT_CREATED } from './comment.event';
import eventbus from '@common/eventbus';

export class CommentService {
    static async create(auth: IAuthUser, req: ICreateCommentRequest): Promise<IComment> {
        const post = await Post.findById(req.post_id);
        if (!post) {
            throw new APIError({
                message: `auth.login.${httpStatus.BAD_REQUEST}.${ErrorCode.POST_NOT_FOUND}`,
                status: httpStatus.BAD_REQUEST,
                errorCode: ErrorCode.POST_NOT_FOUND,
            });
        }
        let left;
        let right;
        let newComment;
        let level = 1;
        let parentName;
        const user = await User.findById(auth.id);
        if (req.parent_id) {
            // get parent comment
            let parentComment = await Comment.findById(req.parent_id);
            if (!parentComment) {
                throw new APIError({
                    message: `auth.login.${httpStatus.BAD_REQUEST}.${ErrorCode.COMMENT_NOT_FOUND}`,
                    status: httpStatus.BAD_REQUEST,
                    errorCode: ErrorCode.COMMENT_NOT_FOUND,
                });
            }
            level = parentComment.level + 1;

            // get max of right
            left = parentComment.right;
            right = parentComment.right + 1;

            parentName = parentComment.user_name;
            // update right of parent comment
            // bulk write operator

            // update comment count reply
            parentComment = await Comment.findOneAndUpdate(
                {
                    _id: req.parent_id,
                },
                {
                    $inc: { reply_count: 1 },
                },
                { new: true },
            );

            await Comment.updateMany({ right: { $gte: parentComment.right } }, { $inc: { right: 2 } });
            await Comment.updateMany({ left: { $gte: parentComment.right } }, { $inc: { left: 2 } });
            // index the nao cho hop ly
            // gia xu co 10 trieu ban ghi, lieu co hop ly ko
        } else {
            // get max of right
            const lastComment = await Comment.findOne({ post_id: req.post_id, parent_id: null }).sort({ right: -1 });
            left = lastComment ? lastComment.right + 1 : 1;
            right = lastComment ? lastComment.right + 2 : 2;
        }

        newComment = await Comment.create(
            new Comment({
                user_id: auth.id,
                user_name: auth.name,
                user_avatar: user.avatar,
                content: req.content,
                post_id: req.post_id,
                right,
                left,
                parent_id: req.parent_id,
                level,
                parent_name: parentName,
            }),
        );

        eventbus.emit(EVENT_COMMENT_CREATED, newComment);

        return newComment;
    }

    static async getComments(auth: IAuthUser, req: IGetCommentsRequest): Promise<IComment[]> {
        const post = await Post.findById(req.post_id);
        if (!post) {
            throw new APIError({
                message: `auth.login.${httpStatus.BAD_REQUEST}.${ErrorCode.POST_NOT_FOUND}`,
                status: httpStatus.BAD_REQUEST,
                errorCode: ErrorCode.POST_NOT_FOUND,
            });
        }
        let comments;
        if (req.parent_id) {
            const parentComment = await Comment.findById(req.parent_id);
            if (!parentComment) {
                throw new APIError({
                    message: `auth.login.${httpStatus.BAD_REQUEST}.${ErrorCode.COMMENT_NOT_FOUND}`,
                    status: httpStatus.BAD_REQUEST,
                    errorCode: ErrorCode.COMMENT_NOT_FOUND,
                });
            }

            comments = await Comment.find({
                post_id: req.post_id,
                parent_id: req.parent_id,
                left: { $gt: parentComment.left },
                right: { $lt: parentComment.right },
            });

            return comments;
        }

        comments = await Comment.find({ post_id: req.post_id, parent_id: null });

        return comments;
    }
}
