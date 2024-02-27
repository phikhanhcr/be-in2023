import { IResetPassword } from '@common/auth/auth.interface';
import { AuthService } from '@common/auth/auth.service';
import User from '@common/user/User';
import { UserService } from '@common/user/user.service';

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

    static async getProfileByUsername(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = await UserService.getProfileByUsername(req.query.username as string);
            res.sendJson({
                message: 'Operation executed successfully!',
                data,
            });
        } catch (error) {
            next(error);
        }
    }

    static async getUserInfoById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log({ id: req.params.id });
            const data = await UserService.getUserInfoById(req.params.id as unknown as number);
            res.sendJson({
                message: 'Operation executed successfully!',
                data: data.transform(),
            });
        } catch (error) {
            next(error);
        }
    }

    static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await UserService.resetPassword(req.user, req.body as IResetPassword);
            res.sendJson({ data: 'Oke' });
        } catch (error) {
            next(error);
        }
    }
}
