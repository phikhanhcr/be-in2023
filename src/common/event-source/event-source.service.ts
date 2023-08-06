import { KafkaAdapter } from '@common/infrastructure/kafka.adapter';
import { EventKey, EventTopics } from './event-source.topic';
import { EventData, EventObjectType } from './EventData';
import logger from '@common/logger';
import eventbus from '@common/eventbus';
import { EVENT_POST_LIKED, EVENT_POST_UNLIKED } from '@common/post/post.event';
import { IPost } from '@common/post/Post';
import { IAuthUser } from '@common/auth/auth.interface';
import User from '@common/user/User';

export class EventSourceService {
    static register(): void {
        // do something
        eventbus.on(EVENT_POST_LIKED, EventSourceService.postLikedHandler);
        eventbus.on(EVENT_POST_UNLIKED, EventSourceService.postLikedHandler);
    }

    static async postLikedHandler(post: IPost, auth: IAuthUser): Promise<void> {
        try {
            const user = await User.findById(auth.id);
            const eventTopic = EventTopics.get(EventKey.POST__LIKED);
            await KafkaAdapter.publish(
                new EventData({
                    event: eventTopic.event,
                    topic: eventTopic.topic,
                    key: post._id.toHexString(),
                    subject: {
                        id: auth.id.toString(),
                        data: user,
                    },
                    di_obj: {
                        type: EventObjectType.POST,
                        id: post._id.toHexString(),
                        data: post,
                    },
                }),
            );
        } catch (err) {
            logger.error(`postLikedHandler error: ${err.message}`);
        }
    }

    static async postUnLikedHandler(post: IPost, auth: IAuthUser): Promise<void> {
        try {
            const eventTopic = EventTopics.get(EventKey.POST__UN_LIKED);
            await KafkaAdapter.publish(
                new EventData({
                    event: eventTopic.event,
                    topic: eventTopic.topic,
                    key: post._id.toHexString(),
                    subject: {
                        id: auth.id.toString(),
                    },
                    di_obj: {
                        type: EventObjectType.POST,
                        id: post._id.toHexString(),
                        data: post,
                    },
                }),
            );
        } catch (err) {
            logger.error(`postUnLikedHandler error: ${err.message}`);
        }
    }
}
