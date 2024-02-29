import { IAuthUser, IResetPassword } from '@common/auth/auth.interface';
import User, { IUser, IUserResponse } from './User';
import Post from '@common/post/Post';
import Relation, { RelationStatus } from '@common/relation/Relation';
import { APIError } from '@common/error/api.error';
import httpStatus from 'http-status';
import { ErrorCode } from '@config/errors';
import { PasswordHelper } from '@helper/password.helper';
import { TokenService } from '@common/token/token.service';
import moment from 'moment';
import { RedisAdapter } from '@common/infrastructure/redis.adapter';

export interface IProfileResponse extends IUserResponse {
    count_post: number;
    count_following: number;
    count_follower: number;
}

export class UserService {
    static async getProfile(auth: IAuthUser): Promise<void> {
        // do something
        return await User.findById(auth.id);
    }

    // write for me function get information of user by username in profile page like instagram
    static async getProfileByUsername(username: string): Promise<IProfileResponse> {
        const user = await User.findOne({ name: username });
        const [countPost, followings, followers] = await Promise.all([
            await Post.find({ user_id: user._id }).countDocuments(),
            await Relation.find({ sender_id: user._id, status: RelationStatus.FOLLOWING }).countDocuments(),
            await Relation.find({ receiver_id: user._id, status: RelationStatus.FOLLOWING }).countDocuments(),
        ]);
        return {
            ...user.transform(),
            count_post: countPost,
            count_following: followings,
            count_follower: followers,
        };
    }

    static async getUserInfoById(id: number): Promise<IUser> {
        return await User.findById(id);
    }

    static async resetPassword(auth: IAuthUser, req: IResetPassword): Promise<void> {
        const user = await User.findById(auth.id);
        console.log({ req });
        if (!user || !user.checkPassword(req.old_password)) {
            throw new APIError({
                message: `auth.reset-password.${httpStatus.BAD_REQUEST}.${ErrorCode.AUTH_REQUEST_PASSWORD_INVALID}`,
                status: httpStatus.BAD_REQUEST,
                errorCode: ErrorCode.AUTH_REQUEST_PASSWORD_INVALID,
            });
        }

        if (req.new_password === req.old_password) {
            throw new APIError({
                message: `auth.reset-password.${httpStatus.BAD_REQUEST}.${ErrorCode.AUTH_PASSWORD_NOT_MATCH}`,
                status: httpStatus.BAD_REQUEST,
                errorCode: ErrorCode.AUTH_PASSWORD_NOT_MATCH,
            });
        }

        user.password = PasswordHelper.generateHash(req.new_password);
        await user.save();

        // await RedisAdapter.set(`auth:rf:${req.refresh_token}`, moment().add(10, 'minutes').unix().toString(), 600);
        if (req.force_logout) {
            const allDevice = await TokenService.getAllDeviceId(auth);
            await Promise.all([
                ...allDevice.split(',').map(async (device_id) => {
                    if (device_id !== auth.device_id) {
                        await Promise.all([
                            TokenService.popDeviceId(auth, device_id),
                            TokenService.removeCurrentAuthDevice({ id: auth.id, name: auth.name, device_id }),
                        ]);
                    }
                }),
            ]);
        }
    }
}
