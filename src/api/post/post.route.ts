import { AuthMiddleware } from './../auth/auth.middleware';
import express from 'express';
import { PostController } from './post.controller';
import { validate } from 'express-validation';
import { createPost } from './post.validator';

const router = express.Router();

router.post('/create', AuthMiddleware.requireAuth, validate(createPost, { context: true }), PostController.create);

router.post(
    '/get-by-type',

    // AuthMiddleware.requireAuth,
    PostController.getByType,
);

router.get(
    '/new-feed',
    // AuthMiddleware.requireAuth,
    PostController.newFeed,
);

export default router;
