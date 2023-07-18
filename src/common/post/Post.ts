// tslint:disable-next-line:no-var-requires

import { ITimestamp } from '@common/timestamp.interface';
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
    description: string;
    images: string[];
    type: PostType;
    like_count: number;
    comment_count: number;
    allow_comment: boolean;
    status: PostStatus;
    top_comments: {
        user_id: number;
        content: string;
        created_at: number;
    };
    created_at: number;
}

export interface IPost extends Document, ITimestamp {
    _id: mongoose.Types.ObjectId;
    user_id: number;
    description: string;
    images: string[];
    type: PostType;
    like_count: number;
    comment_count: number;
    allow_comment: boolean;
    status: PostStatus;
    top_comments: {
        user_id: number;
        content: string;
        created_at: Date;
    };

    transform(): IPostResponse;
}

const PostSchema: Schema = new Schema(
    {
        user_id: { type: Number, required: true },
        description: { type: String, trim: true, default: '' },
        images: [{ type: String }],
        type: { type: Number, enum: values(PostType), default: PostType.POST },
        like_count: { type: Number, default: 0 },
        comment_count: { type: Number, default: 0 },
        allow_comment: { type: Boolean, default: true },
        status: { type: Number, enum: values(PostStatus), default: PostStatus.PUBLIC },

        // display on new feed (click to see more will call another api)
        top_comments: {
            type: new Schema(
                {
                    user_id: { type: Number },
                    content: { type: String, trim: true, default: '' },
                    created_at: { type: Date },
                },
                { _id: false },
            ),
        },
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

PostSchema.method({
    transform(): IPostResponse {
        return {
            id: this._id.toHexString(),
            user_id: this.user_id,
            description: this.description,
            images: this.images,
            type: this.type,
            like_count: this.like_count,
            comment_count: this.comment_count,
            allow_comment: this.allow_comment,
            status: this.status,
            top_comments: this.top_comments,
            created_at: moment(this.created_at).unix(),
        };
    },
});

PostSchema.index({ user_id: 1 });

export default mongoose.model('Post', PostSchema);
