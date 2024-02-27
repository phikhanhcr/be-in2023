import { AuthService } from '@common/auth/auth.service';
import { APIError } from '@common/error/api.error';
import { TokenService } from '@common/token/token.service';
import { JWT_EXPIRES_IN, SERVICE_API_KEYS } from '@config/environment';
import { ErrorCode } from '@config/errors';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import httpStatus from 'http-status';
import { ISignInRequest } from './auth.request';
import logger from '@common/logger';
import moment from 'moment';
export class AuthMiddleware {
    static async signIn(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = await AuthService.signIn(req.body as ISignInRequest);

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
            user.device_id = req.body.device_id;
            req.locals.user = user;
            console.log({ user });
            next();
        } catch (error) {
            next(error);
        }
    }

    static async storeDevice(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            try {
                next();
                const user = req.locals.user;
                const auth = { id: user.id, name: user.name, device_id: req.body.device_id };
                await Promise.all([TokenService.setCurrentAuthDevice(auth), TokenService.addDeviceId(auth)]);
            } catch (error) {
                logger.error('Cannot store device: ', error);
            }
        } catch (error) {
            next(error);
        }
    }

    static authenticate(): RequestHandler {
        return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                const user = await TokenService.getAuthInfoFromToken(req.headers.authorization.split(' ')[1]);
                if (!user) {
                    throw new APIError({
                        message: 'common.unauthorized',
                        status: httpStatus.UNAUTHORIZED,
                        errorCode: ErrorCode.REQUEST_UNAUTHORIZED,
                    });
                }
                req.user = user;
                next();
            } catch (error) {
                next(error);
            }
        };
    }

    static authenticateService(): RequestHandler {
        return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                const apiKey = req.header('x-bitu-api-key');
                if (!apiKey || !SERVICE_API_KEYS.includes(apiKey)) {
                    throw new APIError({
                        message: 'common.unauthorized',
                        status: httpStatus.UNAUTHORIZED,
                        errorCode: ErrorCode.REQUEST_UNAUTHORIZED,
                    });
                }
                next();
            } catch (error) {
                next(error);
            }
        };
    }

    static requireAuth = AuthMiddleware.authenticate();
    static requireServiceAuth = AuthMiddleware.authenticateService();
}
