import { APIError } from '@common/error/api.error';
import { TokenService } from '@common/token/token.service';
import { ErrorCode } from '@config/errors';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import httpStatus from 'http-status';
export class AuthMiddleware {
    static authenticate(): RequestHandler {
        return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                console.log({ headers: req.headers });
                const user = await TokenService.getAuthInfoFromToken(req.headers.authorization.split(' ')[1]);
                console.log('user');
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

    static requireAuth = AuthMiddleware.authenticate();
}
