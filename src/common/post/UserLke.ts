// tslint:disable-next-line:no-var-requires

import { ITimestamp } from '@common/timestamp.interface';
import { values } from 'lodash';
import mongoose, { Document, Schema } from 'mongoose';

export enum LikeType {
    POST = 1,
    COMMENT = 2,
}

export enum LikeStatus {
    LIKE = 1,
    UNLIKE = 2,
}

export interface IUserLikeResponse {
    id: string;
    user_id: number;
    username: string;
    reference_id: string;
    type: LikeType;
    like_count: number;
    status: LikeStatus;
}

export interface IUserLike extends Document, ITimestamp {
    _id: mongoose.Types.ObjectId;
    user_id: number;
    username: string;
    // can be post, comment
    reference_id: mongoose.Types.ObjectId;
    type: LikeType;
    like_count: number;
    status: LikeStatus;

    transform(): IUserLikeResponse;
}

const UserLikeSchema: Schema = new Schema(
    {
        user_id: { type: Number, required: true },
        username: { type: String, default: null },
        reference_id: { type: mongoose.Types.ObjectId, default: null, required: true },
        type: {
            type: Number,
            enum: {
                values: values(LikeType),
            },
            default: LikeType.POST,
        },
        like_count: { type: Number, default: 0 },
        status: {
            type: Number,
            enum: {
                values: values(LikeStatus).concat([null]),
            },
            default: null,
        },
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

UserLikeSchema.method({
    transform(): IUserLikeResponse {
        return {
            id: this._id.toHexString(),
            user_id: this.user_id,
            username: this.username,
            reference_id: this.reference_id.toHexString(),
            type: this.type,
            like_count: this.like_count,
            status: this.status,
        };
    },
});

UserLikeSchema.index({ reference_id: 1, status: 1 });

export default mongoose.model<IUserLike>('UserLike', UserLikeSchema);
