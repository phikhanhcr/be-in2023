import eventbus from '@common/eventbus';
import Post, { IPost } from './Post';
import { IAuthUser } from '@common/auth/auth.interface';
import UserLike, { LikeStatus, LikeType } from './UserLke';

export const EVENT_POST_LIKED = 'post-liked';
export const EVENT_POST_UNLIKED = 'post-unliked';
export class PostEvent {
    static register(): void {
        eventbus.on(EVENT_POST_LIKED, PostEvent.handlePostLiked);
        eventbus.on(EVENT_POST_UNLIKED, PostEvent.handlePostUnLiked);
    }

    static async handlePostLiked(post: IPost, auth: IAuthUser): Promise<void> {
        console.log({ auth, post });
        // do something
        const dataUpdate = {
            $push: {
                top_likes: {
                    user_id: auth.id,
                    user_name: auth.name,
                },
            },
        };
        if (post.top_likes.length) {
            delete dataUpdate.$push;
        }
        await Post.updateOne(
            {
                _id: post._id,
            },
            dataUpdate,
        );
    }

    static async handlePostUnLiked(post: IPost, auth: IAuthUser): Promise<void> {
        // do something
        const dataUpdate = {
            $pull: {
                top_likes: {
                    user_id: auth.id,
                },
            },
        } as {
            $pull: any;
            $push: any;
        };

        const anotherUserLike = await UserLike.findOne({
            reference_id: post._id,
            type: LikeType.POST,
            status: LikeStatus.LIKE,
        });
        if (anotherUserLike) {
            dataUpdate.$push = {
                top_likes: {
                    user_id: anotherUserLike.user_id,
                    user_name: anotherUserLike.username,
                },
            };
        }
        // if (!post.top_likes.length) {
        // }
        await Post.updateOne(
            {
                _id: post._id,
            },
            dataUpdate,
        );
    }
}
