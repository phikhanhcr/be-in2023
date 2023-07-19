import { PostService } from '@common/post/post.service';
import { ICreatePostRequest, IGetPOstByTypeRequest } from './post.request';
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
            const result = await PostService.getPostByType(body);

            res.sendJson({
                message: 'Operation executed successfully!',
                data: result.map((ele) => ele.transform()),
            });
        } catch (error) {
            next(error);
        }
    }

    static async newFeed(req: Request, res: Response, next: NextFunction): Promise<void> {
        // do something
        const body = { ...req.body } as IGetPOstByTypeRequest;
        const result = await PostService.getPostByType(body);

        res.sendJson({
            message: 'Operation executed successfully!',
            data: result.map((ele) => ele.transform()),
        });
    }
}
