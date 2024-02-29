import { AuthService } from '@common/auth/auth.service';
import { NextFunction, Request, Response } from 'express';
import { ISignInRequest, ISignUpRequest } from './auth.request';
import { APIError } from '@common/error/api.error';
import httpStatus from 'http-status';
import { ErrorCode } from '@config/errors';
import { IRefreshToken, IResetPassword } from '@common/auth/auth.interface';

export class AuthController {
    static async generateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { user } = req.locals;
            const token = await AuthService.generateToken(user);
            res.sendJson({ data: { user: user.transform(), token: token.transform() } });
        } catch (error) {
            next(error);
        }
    }

    static async signUp(req: Request, res: Response, next: NextFunction): Promise<void> {
        // do something

        try {
            const user = await AuthService.signUp(req.body as ISignUpRequest);

            if (!user) {
                throw new APIError({
                    message: `auth.login.${httpStatus.BAD_REQUEST}.${ErrorCode.SERVER_AUTH_ERROR}`,
                    status: httpStatus.BAD_REQUEST,
                    errorCode: ErrorCode.SERVER_AUTH_ERROR,
                });
            }
            if (!req.locals) {
                req.locals = {};
            }
            req.locals.user = user;

            next();
        } catch (error) {
            next(error);
        }
    }

    static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const request = req.body as unknown as IRefreshToken;
            const user = req.user;
            const token = await AuthService.refreshToken(user, request);
            res.sendJson({ data: token.transform() });
        } catch (error) {
            next(error);
        }
    }
}
