import express from 'express';
import { UserController } from './user.controller';
import { AuthMiddleware } from '@api/auth/auth.middleware';
import { validate } from 'express-validation';
import { getInfo, getInfoById } from './user.validator';
import { resetPassword } from '@api/auth/auth.validator';
import { AuthController } from '@api/auth/auth.controller';

const router = express.Router();

router.get('/me', AuthMiddleware.requireAuth, UserController.getProfile);

router.get(
    '/user-info',
    AuthMiddleware.requireAuth,
    validate(getInfo, { context: true }),
    UserController.getProfileByUsername,
);

router.post(
    '/reset-password',
    AuthMiddleware.requireAuth,
    validate(resetPassword, { context: true }),
    UserController.resetPassword,
);

router.get(
    '/:id',
    AuthMiddleware.requireServiceAuth,
    validate(getInfoById, { context: true }),
    UserController.getUserInfoById,
);

export default router;
