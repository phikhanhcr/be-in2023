// tslint:disable-next-line:no-var-requires

import { ITimestamp } from '@common/timestamp.interface';
import { DEFAULT_USER_AVATAR } from '@config/user';
import { values } from 'lodash';
import moment from 'moment-timezone';
import mongoose, { Document, Schema } from 'mongoose';

export enum PostType {
    REELS = 1,
    POST = 2,
    VIDEO = 3,
}

export enum PostStatus {
    PUBLIC = 1,
    PRIVATE = 2,
}

export interface IPostResponse {
    id: string;
    user_id: number;
    username: string;
    user_avatar: string;
    description: string;
    images_url: string[];
    type: PostType;
    like_count: number;
    comment_count: number;
    allow_comment: boolean;
    status: PostStatus;
    top_comments: [
        {
            user_id: number;
            user_name: string;
            content: string;
            created_at: number;
        },
    ];
    top_likes: [
        {
            user_id: number;
            user_name: string;
        },
    ];
    is_liked?: boolean;
    created_at: number;
}

export interface IPost extends Document, ITimestamp {
    _id: mongoose.Types.ObjectId;
    user_id: number;
    username: string;
    user_avatar: string;
    description: string;
    images_url: string[];
    type: PostType;
    like_count: number;
    comment_count: number;
    allow_comment: boolean;
    status: PostStatus;
    top_comments: [
        {
            user_id: number;
            content: string;
            created_at: Date;
        },
    ];
    top_likes: [
        {
            user_id: number;
            user_name: string;
        },
    ];

    transform(): IPostResponse;
}

const PostSchema: Schema = new Schema(
    {
        user_id: { type: Number, required: true },
        username: { type: String, default: '' },
        user_avatar: { type: String, default: '' },
        description: { type: String, trim: true, default: '' },
        images_url: [{ type: String }],
        type: {
            type: Number,
            enum: {
                values: values(PostType),
            },
            default: PostType.POST,
        },
        like_count: { type: Number, default: 0 },
        comment_count: { type: Number, default: 0 },
        allow_comment: { type: Boolean, default: true },
        status: {
            type: Number,
            enum: {
                values: values(PostStatus),
            },
            default: PostStatus.PUBLIC,
        },

        // display on new feed (click to see more will call another api)
        top_comments: [
            {
                type: new Schema(
                    {
                        user_id: { type: Number },
                        content: { type: String, trim: true, default: '' },
                        created_at: { type: Date },
                    },
                    { _id: false },
                ),
            },
        ],
        top_likes: [
            {
                type: new Schema(
                    {
                        user_id: { type: Number },
                        user_name: { type: String },
                    },
                    { _id: false },
                ),
                default: [],
            },
        ],
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

PostSchema.method({
    transform(): IPostResponse {
        const topComments = this.top_comments.map((comment) => {
            return {
                user_id: comment.user_id,
                user_name: comment.user_name,
                content: comment.content,
                created_at: moment(comment.created_at).unix(),
            };
        });
        const topLikes = this.top_likes.map((like) => {
            return {
                user_id: like.user_id,
                user_name: like.user_name,
            };
        });
        return {
            id: this._id.toHexString(),
            user_id: this.user_id,
            username: this.username,
            user_avatar: this.user_avatar ? this.user_avatar : DEFAULT_USER_AVATAR,
            description: this.description,
            images_url: this.images_url,
            type: this.type,
            like_count: this.like_count,
            comment_count: this.comment_count,
            allow_comment: this.allow_comment,
            status: this.status,
            top_comments: topComments,
            created_at: moment(this.created_at).unix(),
            top_likes: topLikes,
        };
    },
});

PostSchema.index({ user_id: 1 });

export default mongoose.model<IPost>('Post', PostSchema);
