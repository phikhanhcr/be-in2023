import mongoose, { Document, Schema } from 'mongoose';
import { values } from 'lodash';
import { ITimestamp } from '@common/timestamp.interface';

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
}

export interface IRelation extends Document, ITimestamp {
    _id: mongoose.Types.ObjectId;
    sender_id: number;
    receiver_id: number;
    status: RelationStatus;

    transform(): IRelationResponse;
}

const RelationSchema: Schema = new Schema(
    {
        sender_id: { type: Number, required: true },
        receiver_id: { type: Number, require: true },
        status: {
            type: Number,
            enum: values(RelationStatus),
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
        };
    },
});

RelationSchema.index({ sender_id: 1, receiver_id: 1 }, { unique: true });

export default mongoose.model<IRelation>('Relation', RelationSchema);
