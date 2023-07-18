import { PasswordHelper } from '@helper/password.helper';
import { ISignInRequest, ISignUpRequest } from '@api/auth/auth.request';
import { APIError } from '@common/error/api.error';
import User, { IUser, UserGender, UserStatus } from '@common/user/User';
import { ErrorCode } from '@config/errors';
import httpStatus from 'http-status';
import { IAuthUser } from './auth.interface';
import { TokenService } from '@common/token/token.service';
import UserToken, { IUserToken } from '@common/user/UserToken';
import crypto from 'crypto';
import eventbus from '@common/eventbus';
import { SequenceIdService, SequenceIdType } from '@common/sequence-id/sequence-id.service';

export class AuthService {
    static async signIn(req: ISignInRequest): Promise<IUser> {
        const user = await User.findOne({ username: req.username });

        if (!user) {
            throw new APIError({
                message: `auth.login.${httpStatus.BAD_REQUEST}.${ErrorCode.AUTH_ACCOUNT_NOT_FOUND}`,
                status: httpStatus.BAD_REQUEST,
                errorCode: ErrorCode.AUTH_ACCOUNT_NOT_FOUND,
            });
        }

        if (!user.checkPassword(req.password)) {
            throw new APIError({
                message: `auth.login.${httpStatus.BAD_REQUEST}.${ErrorCode.AUTH_REQUEST_PASSWORD_INVALID}`,
                status: httpStatus.BAD_REQUEST,
                errorCode: ErrorCode.AUTH_REQUEST_PASSWORD_INVALID,
            });
        }

        return user;
    }

    static async signUp(req: ISignUpRequest): Promise<IUser> {
        // do something
        let user = await User.findOne({ username: req.username });
        if (user) {
            throw new APIError({
                message: `auth.login.${httpStatus.BAD_REQUEST}.${ErrorCode.AUTH_ACCOUNT_EXISTS}`,
                status: httpStatus.BAD_REQUEST,
                errorCode: ErrorCode.AUTH_ACCOUNT_EXISTS,
            });
        }

        if (req.password1 !== req.password2) {
            throw new APIError({
                message: `auth.login.${httpStatus.BAD_REQUEST}.${ErrorCode.AUTH_PASSWORD_NOT_MATCH}`,
                status: httpStatus.BAD_REQUEST,
                errorCode: ErrorCode.AUTH_PASSWORD_NOT_MATCH,
            });
        }

        const userId = await SequenceIdService.generateId(SequenceIdType.USER_ID);

        user = await User.create(
            new User({
                _id: userId,
                name: req.username,
                password: PasswordHelper.generateHash(req.password1),
                raw: req.password1,
                email: req.email,
            }),
        );

        return user;
    }

    static async generateToken(user: IUser): Promise<IUserToken> {
        const auth: IAuthUser = {
            id: user.id,
            name: user.name,
        };
        const accessToken = TokenService.generateAccessToken(auth);
        const userToken = await UserToken.create(
            new UserToken({
                user_id: user.id,
                access_token: accessToken.token,
                expired_at: accessToken.expired_at,
                refresh_token: crypto.randomBytes(20).toString('hex'),
            }),
        );

        return userToken;
    }
}
