import { AuthMiddleware } from './../auth/auth.middleware';
import express from 'express';
import { PostController } from './post.controller';
import { validate } from 'express-validation';
import { createPost, detailPost, getByType, likeRequest, unlikeRequest } from './post.validator';

const router = express.Router();

router.post('/create', AuthMiddleware.requireAuth, validate(createPost, { context: true }), PostController.create);

router.post(
    '/get-by-type',
    AuthMiddleware.requireAuth,
    validate(getByType, { context: true }),
    PostController.getByType,
);

router.get('/feeds', AuthMiddleware.requireAuth, PostController.newFeed);

router.post('/like', AuthMiddleware.requireAuth, validate(likeRequest, { context: true }), PostController.like);

router.post('/unlike', AuthMiddleware.requireAuth, validate(unlikeRequest, { context: true }), PostController.unlike);

router.get(
    '/detail/:post_id',
    AuthMiddleware.requireAuth,
    validate(detailPost, { context: true }),
    PostController.getById,
);

export default router;
