import { PostService } from '@common/post/post.service';
import {
    ICreatePostRequest,
    IGetPOstByTypeRequest,
    IGetPostDetail,
    ILikePostRequest,
    IUnlikePostRequest,
} from './post.request';
import { NextFunction, Request, Response } from 'express';

export class PostController {
    static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        // do something
        try {
            const { user } = req;
            const body = { ...req.body } as ICreatePostRequest;
            console.log({ body });
            const result = await PostService.create(user, body);

            res.sendJson({
                message: 'Operation executed successfully!',
                data: result.transform(),
            });
        } catch (error) {
            next(error);
        }
    }

    static async getByType(req: Request, res: Response, next: NextFunction): Promise<void> {
        // do something
        try {
            const body = { ...req.body } as IGetPOstByTypeRequest;
            const result = await PostService.getPostsByType(body);

            res.sendJson({
                message: 'Operation executed successfully!',
                data: result.map((ele) => ele.transform()),
            });
        } catch (error) {
            next(error);
        }
    }

    static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        // do something
        try {
            const { post_id } = req.params;
            const result = await PostService.getById({ post_id });

            res.sendJson({
                message: 'Operation executed successfully!',
                data: result.transform(),
            });
        } catch (error) {
            next(error);
        }
    }

    static async newFeed(req: Request, res: Response, next: NextFunction): Promise<void> {
        // do something
        try {
            const result = await PostService.getMewFeed(req.user);

            res.sendJson({
                message: 'Operation executed successfully!',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    static async like(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const body = { ...req.body } as ILikePostRequest;
            const { user } = req;
            await PostService.like(user, body);

            res.sendJson({
                message: 'Operation executed successfully!',
                data: {},
            });
        } catch (error) {
            next(error);
        }
    }

    static async unlike(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const body = { ...req.body } as IUnlikePostRequest;
            const { user } = req;
            await PostService.unlike(user, body);

            res.sendJson({
                message: 'Operation executed successfully!',
                data: {},
            });
        } catch (error) {
            next(error);
        }
    }
}
