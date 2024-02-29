import { IAuthUser } from '@common/auth/auth.interface';
import { APIError } from '@common/error/api.error';
import { RedisAdapter } from '@common/infrastructure/redis.adapter';
import logger from '@common/logger';
import User from '@common/user/User';
import UserToken from '@common/user/UserToken';
import { JWT_EXPIRES_IN, JWT_PRIVATE_KEY, JWT_PUBLIC_KEY } from '@config/environment';
import { ErrorCode } from '@config/errors';
import httpStatus from 'http-status';
import jwt, { SignOptions } from 'jsonwebtoken';
import moment from 'moment-timezone';

interface AccessToken {
    token: string;
    expired_at: Date;
}

interface TokenPayload {
    iss: string;
    iat: number;
    name: string;
    sub: string; // User ID
    device_id: string;
}

const JWT_ALGORITHM = 'RS256';
const JWT_ISSUER = 'instagram';

export const buildValidDevicesKey = (auth: IAuthUser) => {
    return `backend:valid_device:${auth.id}`;
};

export const buildUDeviceKeyAndUserId = (auth: IAuthUser) => {
    return `backend:user:${auth.id}:device:${auth.device_id}`;
};

export class TokenService {
    static async verifyAccessToken(token: string): Promise<TokenPayload> {
        return (await jwt.verify(token, JWT_PUBLIC_KEY, { algorithms: [JWT_ALGORITHM] })) as TokenPayload;
    }

    static generateAccessToken(
        auth: IAuthUser,
        currentTimeToCheck: Date = new Date(),
        tokenExpiredAt: number = null,
    ): AccessToken {
        const expiredAt = moment(currentTimeToCheck).add(tokenExpiredAt || JWT_EXPIRES_IN, 's');
        const payload = {
            device_id: auth.device_id,
            id: auth.id,
            exp: expiredAt.unix(),
            name: auth.name,
            kid: 'jiZ1eZOitnNmJal7rVsTmS0awjYcJ4XT',
        };

        const options: SignOptions = {
            algorithm: JWT_ALGORITHM,
            issuer: JWT_ISSUER,
            subject: `${auth.id}`,
        };

        return {
            token: jwt.sign(payload, JWT_PRIVATE_KEY, options),
            expired_at: expiredAt.toDate(),
        };
    }

    static async getAuthInfoFromToken(token: string): Promise<IAuthUser> {
        try {
            const tokenInfo = await TokenService.verifyAccessToken(token);
            return {
                id: +tokenInfo.sub,
                name: tokenInfo.name,
                device_id: tokenInfo.device_id,
                iat: tokenInfo.iat,
            };
        } catch (error) {
            logger.error(error);
        }
    }

    // remove token
    static async removeToken(auth: IAuthUser): Promise<void> {
        const user = await User.findById(auth.id);
        if (!user) {
            throw new APIError({
                message: `auth.logout.${httpStatus.BAD_REQUEST}.${ErrorCode.AUTH_ACCOUNT_NOT_FOUND}`,
                status: httpStatus.BAD_REQUEST,
                errorCode: ErrorCode.AUTH_ACCOUNT_NOT_FOUND,
            });
        }

        await UserToken.deleteMany({ user_id: user.id });
    }

    // store all device id
    static async setAllDeviceId(auth: IAuthUser, device_ids: string, expiredAt: Date): Promise<void> {
        await RedisAdapter.set(buildValidDevicesKey(auth), device_ids, moment(expiredAt).unix() - moment().unix());
    }

    static async getAllDeviceId(auth: IAuthUser): Promise<string> {
        return (await RedisAdapter.get(buildValidDevicesKey(auth))) as string;
    }

    // do quick, there are many ways to store value (table, hash_map, etc... in redis)
    static async addDeviceId(auth: IAuthUser): Promise<void> {
        const allDevice = (await RedisAdapter.get(buildValidDevicesKey(auth))) as string;
        if (allDevice) {
            const deviceIds = allDevice.split(',');
            if (deviceIds.indexOf(auth.device_id) === -1) {
                deviceIds.push(auth.device_id);
                await RedisAdapter.set(
                    buildValidDevicesKey(auth),
                    deviceIds.join(','),
                    moment().add(JWT_EXPIRES_IN, 's').unix(),
                );
            }
        } else {
            await RedisAdapter.set(
                buildValidDevicesKey(auth),
                auth.device_id,
                moment().add(JWT_EXPIRES_IN, 's').unix(),
            );
        }
    }

    static async popDeviceId(auth: IAuthUser, deviceId: string): Promise<void> {
        const allDevice = (await RedisAdapter.get(buildValidDevicesKey(auth))) as string;
        if (allDevice) {
            const deviceIds = allDevice.split(',');
            const index = deviceIds.indexOf(deviceId);
            if (index > -1) {
                deviceIds.splice(index, 1);
                await RedisAdapter.set(
                    buildValidDevicesKey(auth),
                    deviceIds.join(','),
                    moment().add(JWT_EXPIRES_IN, 's').unix(),
                );
            }
        }
    }

    static async removeDeviceIds(auth: IAuthUser): Promise<void> {
        await RedisAdapter.delete(buildValidDevicesKey(auth));
    }

    // store time expired of device
    // theo cach nay thi request nao cung se phai gui device id len=
    static async setCurrentAuthDevice(auth: IAuthUser, expiredAt?: Date): Promise<void> {
        if (!expiredAt) {
            expiredAt = moment().add(JWT_EXPIRES_IN, 's').toDate();
        }

        await RedisAdapter.set(
            buildUDeviceKeyAndUserId(auth),
            moment(expiredAt).unix(),
            moment(expiredAt).unix() - moment().unix(),
        );
    }

    static async getCurrentAuthDevice(auth: IAuthUser): Promise<boolean> {
        return !!(await RedisAdapter.get(buildUDeviceKeyAndUserId(auth)));
    }

    static async removeCurrentAuthDevice(auth: IAuthUser): Promise<void> {
        await RedisAdapter.delete(buildUDeviceKeyAndUserId(auth));
    }
}
