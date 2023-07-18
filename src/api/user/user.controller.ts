import User from '@common/user/User';

import { NextFunction, Request, Response } from 'express';
export class UserController {
    static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = await User.findById(req.user.id);
            res.sendJson({
                message: 'Operation executed successfully!',
                data: user.transform(),
            });
        } catch (error) {
            next(error);
        }
    }
}
