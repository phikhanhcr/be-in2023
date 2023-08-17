import { RelationService } from '@common/relation/relation.service';
import { NextFunction, Request, Response } from 'express';
import {
    IAcceptRequest,
    IRejectRequest,
    IRequestFollowing,
    ITargetUserRequest,
    IUnFollowRequest,
} from './relation.request';

export class RelationController {
    static async request(req: Request, res: Response, next: NextFunction): Promise<void> {
        // do something
        try {
            const { user } = req;
            const body = { ...req.body } as IRequestFollowing;
            await RelationService.request(user, body);
            res.sendJson({
                message: 'Operation executed successfully!',
                data: {},
            });
        } catch (error) {
            next(error);
        }
    }

    static async accept(req: Request, res: Response, next: NextFunction): Promise<void> {
        // do something
        try {
            const { user } = req;
            const body = { ...req.body } as IAcceptRequest;
            await RelationService.accept(user, body);
            res.sendJson({
                message: 'Operation executed successfully!',
                data: {},
            });
        } catch (error) {
            next(error);
        }
    }

    static async reject(req: Request, res: Response, next: NextFunction): Promise<void> {
        // do something
        try {
            const { user } = req;
            const body = { ...req.body } as IRejectRequest;
            await RelationService.accept(user, body);
            res.sendJson({
                message: 'Operation executed successfully!',
                data: {},
            });
        } catch (error) {
            next(error);
        }
    }

    static async unFollow(req: Request, res: Response, next: NextFunction): Promise<void> {
        // do something
        try {
            const { user } = req;
            const body = { ...req.body } as IUnFollowRequest;
            await RelationService.unFollow(user, body);
            res.sendJson({
                message: 'Operation executed successfully!',
                data: {},
            });
        } catch (error) {
            next(error);
        }
    }

    static async listFollowing(req: Request, res: Response, next: NextFunction): Promise<void> {
        // do something
        try {
            const { user } = req;
            const query: ITargetUserRequest = { ...req.query };
            const data = await RelationService.listFollowing(user, query);
            res.sendJson({
                message: 'Operation executed successfully!',
                data: data.map((ele) => ele.transform()),
            });
        } catch (error) {
            next(error);
        }
    }

    static async listFollower(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { user } = req;
            const query: ITargetUserRequest = { ...req.query };
            const data = await RelationService.listFollower(user, query);
            res.sendJson({
                message: 'Operation executed successfully!',
                data: data.map((ele) => ele.transform()),
            });
        } catch (error) {
            next(error);
        }
    }
}
