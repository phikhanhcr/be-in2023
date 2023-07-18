import { IAuthUser } from '@common/auth/auth.interface';
import { APIError } from '@common/error/api.error';
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
    name: string;
    sub: string; // User ID
    device_id: string;
}

const JWT_ALGORITHM = 'RS256';
const JWT_ISSUER = 'instagram';

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
            };
        } catch (error) {
            logger.error(error);
        }
    }

    // refresh token
    static async refreshTOken(refreshToken: string): Promise<AccessToken> {
        const userToken = await UserToken.findOne({ refresh_token: refreshToken });
        if (!userToken) {
            throw new APIError({
                message: `auth.logout.${httpStatus.BAD_REQUEST}.${ErrorCode.AUTH_ACCOUNT_NOT_FOUND}`,
                status: httpStatus.BAD_REQUEST,
                errorCode: ErrorCode.AUTH_ACCOUNT_NOT_FOUND,
            });
        }

        const user = await User.findOne({ _id: userToken.user_id });

        if (!user) {
            throw new APIError({
                message: `auth.logout.${httpStatus.BAD_REQUEST}.${ErrorCode.AUTH_ACCOUNT_NOT_FOUND}`,
                status: httpStatus.BAD_REQUEST,
                errorCode: ErrorCode.AUTH_ACCOUNT_NOT_FOUND,
            });
        }

        return TokenService.generateAccessToken({ id: user.id, name: user.name });
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
}
