import express, { Request, Response } from 'express';
const router = express.Router();
import { NODE_ENV } from '@config/environment';
import testRoutes from './test/test.route';
import userRoutes from './user/user.route';
import authRoutes from './auth/auth.route';
import postRoutes from './post/post.route';
import commentRoutes from './comment/comment.route';
import relationRoutes from './relation/relation.route';

if (NODE_ENV === 'development') {
    router.use('/local', testRoutes);
}

router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);

router.use('/api/posts', postRoutes);
router.use('/api/comments', commentRoutes);
router.use('/api/relations', relationRoutes);

export default router;
