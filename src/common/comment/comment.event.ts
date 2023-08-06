import eventbus from '@common/eventbus';
import { IPost } from '@common/post/Post';
import { IComment } from './Comment';

export const EVENT_COMMENT_CREATED = 'comment-created';

export class CommentEvent {
    static register(): void {
        eventbus.on(EVENT_COMMENT_CREATED, this.commentCreatedHandler);
    }

    static async commentCreatedHandler(post: IPost, comment: IComment): Promise<void> {
        // do something
        // notification to post owner
        // notification to comment owner
    }
}
