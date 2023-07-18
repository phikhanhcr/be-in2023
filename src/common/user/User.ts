import mongoose, { Document, Schema } from 'mongoose';
import { values } from 'lodash';
import { ITimestamp } from '@common/timestamp.interface';
import { PasswordHelper } from '@helper/password.helper';
import { DEFAULT_USER_AVATAR } from '@config/user';

export enum UserStatus {
    PENDING = 0,
    ACTIVE = 1,
    BLOCKED = 2,
}

export enum UserGender {
    MALE = 0,
    FEMALE = 1,
    UNKNOWN = 2,
}

export interface IUserResponse {
    id: number;
    name: string;
    email: string;
    full_name: string;
    // status: UserStatus;
    // gender: UserGender;
    avatar: string;
}

export interface IUser extends Document, ITimestamp {
    _id: number;
    name: string;
    email: string;
    full_name: string;
    password: string;
    raw: string;
    avatar: string;

    checkPassword(password: string): boolean;
    transform(): IUserResponse;
}

const UserSchema: Schema = new Schema(
    {
        _id: { type: Number, required: true, min: 1 },
        name: { type: String, trim: true, default: '' },
        email: { type: String, trim: true, default: '' },
        full_name: { type: String, trim: true, default: '' },
        password: { type: String, required: true },
        raw: { type: String, required: true },
        avatar: { type: String, default: '' },
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    },
);

// populate to User table

UserSchema.method({
    transform(): IUserResponse {
        return {
            id: this._id,
            full_name: this.full_name,
            email: this.email,
            name: this.name,
            avatar: this.avatar !== '' ? this.avatar : DEFAULT_USER_AVATAR,
        };
    },
    checkPassword(password: string): boolean {
        return PasswordHelper.compareHash(password, this.password);
    },
});

UserSchema.index({ name: 1 }, { unique: true, background: true });

export default mongoose.model<IUser>('User', UserSchema);
