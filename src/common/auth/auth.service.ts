import { PasswordHelper } from '@helper/password.helper';
import { ISignInRequest, ISignUpRequest } from '@api/auth/auth.request';
import { APIError } from '@common/error/api.error';
import User, { IUser, UserGender, UserStatus } from '@common/user/User';
import { ErrorCode } from '@config/errors';
import httpStatus from 'http-status';
import { IAuthUser, IRefreshToken, IResetPassword } from './auth.interface';
import { TokenService } from '@common/token/token.service';
import UserToken, { IUserToken } from '@common/user/UserToken';
import crypto from 'crypto';
import eventbus from '@common/eventbus';
import { SequenceIdService, SequenceIdType } from '@common/sequence-id/sequence-id.service';
import moment from 'moment';
import { RedisAdapter } from '@common/infrastructure/redis.adapter';

export class AuthService {
    static async signIn(req: ISignInRequest): Promise<IUser> {
        console.log({ req });
        const user = await User.findOne({ name: req.username });

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
            device_id: user.device_id,
        };
        const accessToken = TokenService.generateAccessToken(auth);
        // moi lan refresh se store lai thoi gian invalid cua token
        // now()
        // jwt chua thong tin create_at (duoc tao ra khi nao, dam bao phai luon lon hon thoi gian luu trong redis cua token)
        // now
        // access token chi co han 5p, het 5p phai call lai refresh_token
        // now ac > now rf
        // reset password:
        // set rf +10p => all ac < now rf
        const rf = crypto.randomBytes(20).toString('hex');
        // await RedisAdapter.set(`auth:rf:${rf}`, moment().unix().toString(), 600);

        const userToken = await UserToken.create(
            new UserToken({
                user_id: user.id,
                access_token: accessToken.token,
                device_id: user.device_id,
                expired_at: accessToken.expired_at,
                refresh_token: rf,
            }),
        );

        return userToken;
    }

    static async refreshToken(auth: IAuthUser, req: IRefreshToken): Promise<IUserToken> {
        let token = await UserToken.findOne({ refresh_token: req.refresh_token });
        if (!token) {
            throw new APIError({
                message: `auth.refresh-token.${httpStatus.BAD_REQUEST}.${ErrorCode.AUTH_REQUEST_NOT_FOUND}`,
                status: httpStatus.BAD_REQUEST,
                errorCode: ErrorCode.AUTH_REQUEST_NOT_FOUND,
            });
        }

        if (!(await TokenService.getCurrentAuthDevice({ id: token.user_id, name: '', device_id: req.device_id }))) {
            throw new APIError({
                message: `auth.refresh-token.${httpStatus.BAD_REQUEST}.${ErrorCode.AUTH_REQUEST_NOT_FOUND}`,
                status: httpStatus.BAD_REQUEST,
                errorCode: ErrorCode.AUTH_REQUEST_NOT_FOUND,
            });
        }

        if (req.device_id && req.device_id !== token.device_id) {
            throw new APIError({
                message: `auth.refresh-token.${httpStatus.BAD_REQUEST}.${ErrorCode.AUTH_REQUEST_NOT_FOUND}`,
                status: httpStatus.BAD_REQUEST,
                errorCode: ErrorCode.AUTH_REQUEST_NOT_FOUND,
            });
        }

        const user = await User.findById(token.user_id);

        if (!user) {
            throw new APIError({
                message: `auth.refresh-token.${httpStatus.BAD_REQUEST}.${ErrorCode.AUTH_REQUEST_NOT_FOUND}`,
                status: httpStatus.BAD_REQUEST,
                errorCode: ErrorCode.AUTH_REQUEST_NOT_FOUND,
            });
        }

        // get5 current device id

        const accessToken = TokenService.generateAccessToken({ id: user.id, name: user.name });

        await TokenService.setCurrentAuthDevice(auth);
        // await RedisAdapter.set(`auth:rf:${req.refresh_token}`, moment().unix().toString(), 600);
        // await TokenService.setCurrentAuthDevice(
        //     { id: user.id, name: user.name, device_id: req.device_id },
        //     // add 1 minute to expired_at
        //     moment(accessToken.expired_at).add(1, 'minute').toDate(),
        // );
        token = await UserToken.findOneAndUpdate(
            { refresh_token: req.refresh_token },
            {
                access_token: accessToken.token,
                expired_at: accessToken.expired_at,
            },
            {
                new: true,
            },
        );
        return token;
    }
}
