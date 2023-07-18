import express from 'express';
import { UserController } from './user.controller';
import { AuthMiddleware } from '@api/auth/auth.middleware';

const router = express.Router();

router.get('/me', AuthMiddleware.requireAuth, UserController.getProfile);

export default router;
