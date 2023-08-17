import mongoose, { Document, Schema } from 'mongoose';
import { values } from 'lodash';
import { ITimestamp } from '@common/timestamp.interface';
import { IUser } from '@common/user/User';
import { DEFAULT_USER_AVATAR } from '@config/user';

export enum RelationStatus {
    NONE = 1,
    PENDING = 2,
    FOLLOWING = 3,
    RECEIVE = 4,
    REJECT = 5,
    BLOCK = 6,
}

export interface IRelationResponse {
    id: string;
    sender_id: number;
    receiver_id: number;
    status: RelationStatus;

    // populate
    sender_name?: string;
    sender_avatar?: string;
    receiver_name?: string;
    receiver_avatar?: string;
}

export interface IRelation extends Document, ITimestamp {
    _id: mongoose.Types.ObjectId;
    sender_id: number;
    receiver_id: number;
    status: RelationStatus;

    user_sender: IUser;
    user_receiver: IUser;

    transform(): IRelationResponse;
}

const RelationSchema: Schema = new Schema(
    {
        sender_id: { type: Number, required: true },
        receiver_id: { type: Number, require: true },
        status: {
            type: Number,
            enum: {
                values: values(RelationStatus),
            },
            default: RelationStatus.NONE,
        },
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    },
);

// populate to User table

RelationSchema.method({
    transform(): IRelationResponse {
        return {
            id: this._id.toHexString(),
            sender_id: this.sender_id,
            receiver_id: this.receiver_id,
            status: this.status,

            sender_name: this.user_sender?.name || null,
            sender_avatar: this.user_sender
                ? this.user_sender.avatar !== ''
                    ? this.user_sender.avatar
                    : DEFAULT_USER_AVATAR
                : null,
            receiver_name: this.user_receiver?.name || null,
            receiver_avatar: this.user_receiver
                ? this.user_receiver.avatar !== ''
                    ? this.user_receiver.avatar
                    : DEFAULT_USER_AVATAR
                : null,
        };
    },
});

RelationSchema.index({ sender_id: 1, receiver_id: 1 }, { background: true });

RelationSchema.virtual('user_sender', {
    ref: 'User',
    localField: 'sender_id',
    foreignField: '_id',
    justOne: true,
});

RelationSchema.virtual('user_receiver', {
    ref: 'User',
    localField: 'receiver_id',
    foreignField: '_id',
    justOne: true,
});

export default mongoose.model<IRelation>('Relation', RelationSchema);
