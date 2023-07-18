import { IAuthUser } from '@common/auth/auth.interface';
import { IUser } from '@common/user/User';

declare global {
    namespace Express {
        interface Request {
            user?: IAuthUser;
            rawBody: Buffer;
            locals: {
                user?: IUser;
                query?: object;
            };
        }

        interface Response {
            sendJson(data: unknown): this;
        }
    }
}

export {};
