import { AuthMiddleware } from './../auth/auth.middleware';
import express from 'express';
import { validate } from 'express-validation';
import { CommentController } from './comment.controller';
import { createComment, getComments } from './comment.validator';

const router = express.Router();

router.post(
    '/get-comments-by-post',
    AuthMiddleware.requireAuth,
    validate(getComments, { context: true }),
    CommentController.get,
);

router.post(
    '/create',
    AuthMiddleware.requireAuth,
    validate(createComment, { context: true }),
    CommentController.create,
);

export default router;
