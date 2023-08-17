import express from 'express';
import { validate } from 'express-validation';
import { RelationController } from './relation.controller';
import {
    acceptFollowing,
    listFollowers,
    listFollowing,
    rejectFollowing,
    requestFollowing,
    unFollowing,
} from './relation.validator';
import { AuthMiddleware } from '@api/auth/auth.middleware';

const router = express.Router();

// require following
router.post(
    '/request',
    AuthMiddleware.requireAuth,
    validate(requestFollowing, { context: true }),
    RelationController.request,
);

// accept following
router.post(
    '/accept',
    AuthMiddleware.requireAuth,
    validate(acceptFollowing, { context: true }),
    RelationController.accept,
);

// reject following
router.post(
    '/reject',
    AuthMiddleware.requireAuth,
    validate(rejectFollowing, { context: true }),
    RelationController.reject,
);

// unfollow
router.post(
    '/un-follow',
    AuthMiddleware.requireAuth,
    validate(unFollowing, { context: true }),
    RelationController.unFollow,
);

// list following
router.get(
    '/user-following',
    AuthMiddleware.requireAuth,
    validate(listFollowing, { context: true }),
    RelationController.listFollowing,
);

// list follower
router.get(
    '/followers',
    AuthMiddleware.requireAuth,
    validate(listFollowers, { context: true }),
    RelationController.listFollower,
);

export default router;
