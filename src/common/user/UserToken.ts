import { ITimestamp } from '@common/timestamp.interface';
import mongoose, { Schema, Document } from 'mongoose';
import moment from 'moment-timezone';

export interface IUserTokenResponse {
    access_token: string;
    expired_at: number;
    refresh_token: string;
}

export interface IUserToken extends Document, ITimestamp {
    _id: mongoose.Types.ObjectId;
    user_id: number;
    access_token: string;
    expired_at: Date;
    refresh_token: string;
    refresh_expired_at?: Date;
    device_id?: string;

    transform(): IUserTokenResponse;
}

const UserTokenSchema: Schema = new Schema(
    {
        user_id: { type: Number, required: true },
        access_token: { type: String, trim: true, default: '' },
        expired_at: { type: Date, default: null },
        refresh_token: { type: String, trim: true, required: true },
        refresh_expired_at: { type: Date, default: null },
        device_id: { type: String, default: null },
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    },
);

UserTokenSchema.index(
    { refresh_token: 1 },
    {
        name: 'uq_refresh_token',
        unique: true,
        background: true,
    },
);

UserTokenSchema.index(
    { user_id: 1 },
    {
        name: 'ix_user_id',
        background: true,
    },
);

UserTokenSchema.method({
    /**
     * Transform user object to API response
     *
     * @returns
     */
    transform(): IUserTokenResponse {
        const transformed: IUserTokenResponse = {
            access_token: this.access_token,
            refresh_token: this.refresh_token,
            expired_at: moment(this.expired_at).unix(),
        };

        return transformed;
    },
});

// Export the model and return your IUserToken interface
export default mongoose.model<IUserToken>('UserToken', UserTokenSchema);
