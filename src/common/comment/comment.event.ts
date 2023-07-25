import eventbus from '@common/eventbus';
import { IPost } from '@common/post/Post';
import { IComment } from './Comment';

export const EVENT_COMMENT_CREATED = 'comment-created';

export class PostEvent {
    static register(): void {
        eventbus.on(EVENT_COMMENT_CREATED, this.commentCreatedHandler);
    }

    static async commentCreatedHandler(post: IPost, comment: IComment): Promise<void> {
        // do something
        // do something
    }
}
