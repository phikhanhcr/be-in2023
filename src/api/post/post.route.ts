import { AuthMiddleware } from './../auth/auth.middleware';
import express from 'express';
import { PostController } from './post.controller';

const router = express.Router();

router.post('/create', AuthMiddleware.requireAuth, PostController.create);

export default router;
