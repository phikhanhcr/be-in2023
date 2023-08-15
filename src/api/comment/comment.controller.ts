import { ICreateCommentRequest, IGetCommentsRequest } from '@common/comment/comment.request';
import { CommentService } from '@common/comment/comment.service';

import { NextFunction, Request, Response } from 'express';

export class CommentController {
    static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { user } = req;

            const body = { ...req.body } as ICreateCommentRequest;
            const result = await CommentService.create(user, body);

            res.sendJson({
                message: 'Operation executed successfully!',
                data: result.transform(),
            });
        } catch (error) {
            next(error);
        }
    }

    static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { user } = req;

            const body = { ...req.body } as IGetCommentsRequest;
            const result = await CommentService.getComments(user, body);

            res.sendJson({
                message: 'Operation executed successfully!',
                data: result.map((item) => item.transform()),
            });
        } catch (error) {
            next(error);
        }
    }
}
