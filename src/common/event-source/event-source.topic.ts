export enum TopicName {
    USER = 'User',
    POST = 'Post',
}

export enum EventKey {}

export enum EventKey {
    POST__LIKED = 'post__liked',
    POST__UN_LIKED = 'post__un_liked',
}

export interface IEventTopic {
    event: string;
    topic: TopicName;
}

export const EventTopics: Map<EventKey, IEventTopic> = new Map();

EventTopics.set(EventKey.POST__LIKED, { topic: TopicName.POST, event: 'liked' });
EventTopics.set(EventKey.POST__UN_LIKED, { topic: TopicName.POST, event: 'un_liked' });
