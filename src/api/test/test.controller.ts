import { TokenService } from '@common/token/token.service';
import { NextFunction, Request, Response } from 'express';
export class TestController {
    static async common(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            res.sendJson({
                message: 'Operation executed successfully!',
                data: {},
            });
        } catch (error) {
            next(error);
        }
    }
}
