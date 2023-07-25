import eventbus from '@common/eventbus';

export const EVENT_POST_LIKED = 'post-liked';
export const EVENT_POST_UNLIKED = 'post-unliked';
export class PostEvent {
    static register(): void {
        eventbus.on(EVENT_POST_LIKED, this.handlePostLiked);
        eventbus.on(EVENT_POST_UNLIKED, this.handlePostUnLiked);
    }

    static async handlePostLiked(): Promise<void> {
        // do something
    }

    static async handlePostUnLiked(): Promise<void> {
        // do something
    }
}
