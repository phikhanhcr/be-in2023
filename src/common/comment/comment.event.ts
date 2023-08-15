import eventbus from '@common/eventbus';
import Post, { IPost } from '@common/post/Post';
import { IComment } from './Comment';
import logger from '@common/logger';

export const EVENT_COMMENT_CREATED = 'event-comment-created';

export class CommentEvent {
    static register(): void {
        eventbus.on(EVENT_COMMENT_CREATED, CommentEvent.commentCreatedHandler);
    }

    static async commentCreatedHandler(comment: IComment): Promise<void> {
        // notification to post owner
        // notification to comment owner
        try {
            const dataUpdated = {
                $inc: {
                    comment_count: 1,
                },
                $push: {
                    top_comments: {
                        user_id: comment.user_id,
                        user_name: comment.user_name,
                        content: comment.content,
                        created_at: comment.created_at,
                    },
                },
            };
            let post = await Post.findById(comment.post_id);
            if (post.top_comments && post.top_comments.length) {
                delete dataUpdated.$push;
            }
            post = await Post.findOneAndUpdate(
                {
                    _id: comment.post_id,
                },
                dataUpdated,
                {
                    new: true,
                },
            );
            console.log({ post });
        } catch (error) {
            logger.debug(error);
        }
    }
}
