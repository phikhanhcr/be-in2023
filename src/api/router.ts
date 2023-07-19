import express, { Request, Response } from 'express';
const router = express.Router();
import { NODE_ENV } from '@config/environment';
import testRoutes from './test/test.route';
import userRoutes from './user/user.route';
import authRoutes from './auth/auth.route';
import postRoutes from './post/post.route';
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);

if (NODE_ENV === 'development') {
    router.use('/local', testRoutes);
}

export default router;
