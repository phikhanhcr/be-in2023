import { ITimestamp } from '@common/timestamp.interface';
import mongoose, { Schema, Document } from 'mongoose';

export interface ISequenceId extends Document, ITimestamp {
    current: number;
}

const SequenceIdSchema: Schema = new Schema(
    {
        _id: { type: String, required: true },
        current: { type: Number, required: true },
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    },
);

// Export the model and return your ISequenceId interface
export default mongoose.model<ISequenceId>('SequenceId', SequenceIdSchema);
